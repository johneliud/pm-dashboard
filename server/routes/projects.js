const express = require('express');
const pool = require('../db/connection');
const GitHubService = require('../services/githubService');
const SyncService = require('../services/syncService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all projects for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, github_owner, github_repo, github_project_number, created_at, updated_at 
       FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, githubOwner, githubRepo, githubProjectNumber } = req.body;

    if (!name || !githubOwner || !githubRepo || !githubProjectNumber) {
      return res.status(400).json({ 
        error: 'Name, GitHub owner, repository, and project number are required' 
      });
    }

    // Test GitHub connection
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    const githubService = new GitHubService(githubToken);
    const connectionTest = await githubService.testConnection();
    
    if (!connectionTest.success) {
      return res.status(400).json({ 
        error: `GitHub connection failed: ${connectionTest.error}` 
      });
    }

    // Verify repository access
    const repoTest = await githubService.getRepositoryInfo(githubOwner, githubRepo);
    if (!repoTest.success) {
      return res.status(400).json({ 
        error: `Repository access failed: ${repoTest.error}` 
      });
    }

    // Create project
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, github_owner, github_repo, github_project_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, name, githubOwner, githubRepo, githubProjectNumber]
    );

    const project = result.rows[0];

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        github_owner: project.github_owner,
        github_repo: project.github_repo,
        github_project_number: project.github_project_number,
        created_at: project.created_at
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Project already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync project data from GitHub
router.post('/:projectId/sync', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project ownership
    const projectResult = await pool.query(
      `SELECT github_owner, github_repo, github_project_number 
       FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, req.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    // Perform sync
    const syncService = new SyncService(githubToken);
    const syncResult = await syncService.syncProject(
      projectId,
      project.github_owner,
      project.github_repo,
      project.github_project_number
    );

    if (!syncResult.success) {
      return res.status(400).json({ error: syncResult.error });
    }

    res.json({
      message: 'Sync completed successfully',
      itemsSynced: syncResult.itemsSynced
    });

  } catch (error) {
    console.error('Sync project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project work items
router.get('/:projectId/items', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project ownership
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get work items with assignee info
    const result = await pool.query(
      `SELECT 
        wi.id, wi.github_item_id, wi.github_issue_number, wi.title, wi.status,
        wi.size_estimate, wi.priority, wi.item_type, wi.start_date, wi.end_date,
        wi.milestone, wi.created_at, wi.updated_at,
        tm.github_username, tm.display_name, tm.avatar_url
       FROM work_items wi
       LEFT JOIN team_members tm ON wi.assignee_id = tm.id
       WHERE wi.project_id = $1
       ORDER BY wi.updated_at DESC`,
      [projectId]
    );

    const items = result.rows.map(row => ({
      id: row.id,
      github_item_id: row.github_item_id,
      github_issue_number: row.github_issue_number,
      title: row.title,
      status: row.status,
      size_estimate: row.size_estimate,
      priority: row.priority,
      item_type: row.item_type,
      start_date: row.start_date,
      end_date: row.end_date,
      milestone: row.milestone,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assignee: row.github_username ? {
        username: row.github_username,
        display_name: row.display_name,
        avatar_url: row.avatar_url
      } : null
    }));

    res.json({ items });

  } catch (error) {
    console.error('Get project items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;