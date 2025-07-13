const pool = require('../db/connection');
const GitHubService = require('./githubService');

class SyncService {
  constructor(githubToken) {
    this.githubService = new GitHubService(githubToken);
  }

  async syncProject(projectId, owner, repo, projectNumber) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Log sync start
      const syncLogResult = await client.query(
        `INSERT INTO sync_logs (project_id, sync_type, status, started_at) 
         VALUES ($1, 'full', 'in_progress', NOW()) RETURNING id`,
        [projectId]
      );
      const syncLogId = syncLogResult.rows[0].id;

      // Fetch project items from GitHub
      const itemsResult = await this.githubService.getProjectItems(owner, repo, projectNumber);
      
      if (!itemsResult.success) {
        throw new Error(`GitHub API error: ${itemsResult.error}`);
      }

      const items = itemsResult.items;
      let syncedCount = 0;

      // Process each item
      let failedCount = 0;
      for (const item of items) {
        try {
          await this.processWorkItem(client, projectId, item);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to process item ${item.id}:`, error.message);
          failedCount++;
          // Continue processing other items instead of failing the entire sync
        }
      }
      
      if (failedCount > 0) {
        console.log(`Sync completed with ${failedCount} failed items out of ${items.length} total`);
      }

      // Update sync log
      await client.query(
        `UPDATE sync_logs SET status = 'success', items_synced = $1, completed_at = NOW() WHERE id = $2`,
        [syncedCount, syncLogId]
      );

      await client.query('COMMIT');
      return { success: true, itemsSynced: syncedCount };

    } catch (error) {
      await client.query('ROLLBACK');
      
      // Update sync log with error
      await client.query(
        `UPDATE sync_logs SET status = 'error', error_message = $1, completed_at = NOW() WHERE project_id = $2 AND status = 'in_progress'`,
        [error.message, projectId]
      );
      
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  async processWorkItem(client, projectId, item) {
    try {
      if (!item.content) return;

      const content = item.content;
      const fieldValues = item.fieldValues?.nodes || [];

    // Extract field values
    const getFieldValue = (fieldName) => {
      const field = fieldValues.find(fv => 
        fv.field?.name?.toLowerCase() === fieldName.toLowerCase()
      );
      return field?.text || field?.name || field?.number || field?.date || null;
    };

    // Helper function to safely parse integer values
    const parseIntegerField = (value) => {
      if (value === null || value === undefined) return null;
      
      // If it's already a number, return it
      if (typeof value === 'number') return Math.round(value);
      
      // Try to parse string to number
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper function to safely parse date values
    const parseDateField = (value) => {
      if (!value) return null;
      
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      } catch (error) {
        return null;
      }
    };

    // Process assignees
    let assigneeId = null;
    if (content.assignees?.nodes?.length > 0) {
      const assignee = content.assignees.nodes[0];
      assigneeId = await this.ensureTeamMember(client, projectId, assignee);
    }

    // Prepare work item data with proper type conversion
    const sizeValue = getFieldValue('Size') || getFieldValue('Story Points') || getFieldValue('Estimate') || getFieldValue('Points');
    const startDateValue = getFieldValue('Start Date') || getFieldValue('Started');
    const endDateValue = getFieldValue('End Date') || getFieldValue('Due Date') || getFieldValue('Target Date');
    
    const workItemData = {
      github_item_id: item.id,
      github_issue_number: content.number || null,
      title: content.title || 'Untitled',
      status: getFieldValue('Status') || content.state || 'Unknown',
      assignee_id: assigneeId,
      size_estimate: parseIntegerField(sizeValue),
      priority: getFieldValue('Priority') || 'Medium',
      item_type: item.type || 'Issue',
      start_date: parseDateField(startDateValue),
      end_date: parseDateField(endDateValue),
      milestone: content.milestone?.title || null,
      github_data: JSON.stringify(item)
    };

    // Upsert work item
    await client.query(
      `INSERT INTO work_items (
        project_id, github_item_id, github_issue_number, title, status, 
        assignee_id, size_estimate, priority, item_type, start_date, 
        end_date, milestone, github_data, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (project_id, github_item_id) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        assignee_id = EXCLUDED.assignee_id,
        size_estimate = EXCLUDED.size_estimate,
        priority = EXCLUDED.priority,
        item_type = EXCLUDED.item_type,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        milestone = EXCLUDED.milestone,
        github_data = EXCLUDED.github_data,
        updated_at = NOW()`,
      [
        projectId,
        workItemData.github_item_id,
        workItemData.github_issue_number,
        workItemData.title,
        workItemData.status,
        workItemData.assignee_id,
        workItemData.size_estimate,
        workItemData.priority,
        workItemData.item_type,
        workItemData.start_date,
        workItemData.end_date,
        workItemData.milestone,
        workItemData.github_data
      ]
    );
    } catch (error) {
      console.error(`Error processing work item ${item.id}:`, error);
      // Log the problematic data for debugging
      if (error.message.includes('invalid input syntax for type integer')) {
        console.error('Data type error - Raw field values:', JSON.stringify(fieldValues, null, 2));
      }
      throw error; // Re-throw to be handled by the sync process
    }
  }

  async ensureTeamMember(client, projectId, assignee) {
    // Check if team member exists
    const existingMember = await client.query(
      `SELECT id FROM team_members WHERE project_id = $1 AND github_username = $2`,
      [projectId, assignee.login]
    );

    if (existingMember.rows.length > 0) {
      return existingMember.rows[0].id;
    }

    // Create new team member
    const newMember = await client.query(
      `INSERT INTO team_members (project_id, github_username, display_name, avatar_url)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [projectId, assignee.login, assignee.name || assignee.login, assignee.avatarUrl]
    );

    return newMember.rows[0].id;
  }
}

module.exports = SyncService;