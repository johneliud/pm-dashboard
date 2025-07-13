const pool = require('../db/connection');

class AnalyticsService {
  
  // Get project progress percentage
  async getProjectProgress(projectId) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          COUNT(CASE WHEN status IN ('In Progress', 'In Review') THEN 1 END) as in_progress_items,
          COUNT(CASE WHEN status IN ('Todo', 'Backlog', 'New') THEN 1 END) as todo_items
        FROM work_items 
        WHERE project_id = $1
      `, [projectId]);

      const data = result.rows[0];
      const totalItems = parseInt(data.total_items);
      const completedItems = parseInt(data.completed_items);
      
      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        success: true,
        data: {
          total_items: totalItems,
          completed_items: completedItems,
          in_progress_items: parseInt(data.in_progress_items),
          todo_items: parseInt(data.todo_items),
          progress_percentage: progressPercentage
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get status distribution for pie chart
  async getStatusDistribution(projectId) {
    try {
      const result = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM work_items 
        WHERE project_id = $1 
        GROUP BY status
        ORDER BY count DESC
      `, [projectId]);

      const data = result.rows.map(row => ({
        name: row.status || 'Unknown',
        value: parseInt(row.count)
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get team velocity data
  async getTeamVelocity(projectId) {
    try {
      // Calculate velocity based on completed story points per week
      const result = await pool.query(`
        SELECT 
          DATE_TRUNC('week', updated_at) as week,
          SUM(COALESCE(size_estimate, 1)) as completed_points,
          COUNT(*) as completed_items
        FROM work_items 
        WHERE project_id = $1 
          AND status IN ('Done', 'Completed', 'Closed')
          AND updated_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', updated_at)
        ORDER BY week DESC
        LIMIT 6
      `, [projectId]);

      const data = result.rows.map(row => ({
        week: row.week.toISOString().split('T')[0],
        completed_points: parseInt(row.completed_points) || 0,
        completed_items: parseInt(row.completed_items) || 0
      })).reverse(); // Show oldest to newest

      // Calculate average velocity
      const totalPoints = data.reduce((sum, week) => sum + week.completed_points, 0);
      const averageVelocity = data.length > 0 ? Math.round(totalPoints / data.length) : 0;

      return { 
        success: true, 
        data: {
          weekly_data: data,
          average_velocity: averageVelocity
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get burndown chart data (simplified version)
  async getBurndownData(projectId) {
    try {
      // Get total story points and items
      const totalResult = await pool.query(`
        SELECT 
          SUM(COALESCE(size_estimate, 1)) as total_points,
          COUNT(*) as total_items
        FROM work_items 
        WHERE project_id = $1
      `, [projectId]);

      const totalPoints = parseInt(totalResult.rows[0].total_points) || 0;
      const totalItems = parseInt(totalResult.rows[0].total_items) || 0;

      // Get completion data over last 4 weeks
      const completionResult = await pool.query(`
        SELECT 
          DATE(updated_at) as date,
          SUM(COALESCE(size_estimate, 1)) as points_completed
        FROM work_items 
        WHERE project_id = $1 
          AND status IN ('Done', 'Completed', 'Closed')
          AND updated_at >= NOW() - INTERVAL '4 weeks'
        GROUP BY DATE(updated_at)
        ORDER BY date
      `, [projectId]);

      // Calculate remaining points over time
      let remainingPoints = totalPoints;
      const burndownData = [];
      
      // Add starting point
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      burndownData.push({
        date: fourWeeksAgo.toISOString().split('T')[0],
        remaining_points: totalPoints,
        ideal_remaining: totalPoints
      });

      // Process completion data
      completionResult.rows.forEach((row, index) => {
        remainingPoints -= parseInt(row.points_completed);
        const daysElapsed = index + 1;
        const idealRemaining = Math.max(0, totalPoints - (totalPoints * daysElapsed / 28));
        
        burndownData.push({
          date: row.date.toISOString().split('T')[0],
          remaining_points: Math.max(0, remainingPoints),
          ideal_remaining: Math.round(idealRemaining)
        });
      });

      return {
        success: true,
        data: {
          total_points: totalPoints,
          total_items: totalItems,
          burndown_data: burndownData
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get team workload distribution
  async getTeamWorkload(projectId) {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(tm.display_name, tm.github_username, 'Unassigned') as assignee,
          COUNT(*) as total_items,
          COUNT(CASE WHEN wi.status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          COUNT(CASE WHEN wi.status IN ('In Progress', 'In Review') THEN 1 END) as in_progress_items,
          SUM(COALESCE(wi.size_estimate, 1)) as total_points
        FROM work_items wi
        LEFT JOIN team_members tm ON wi.assignee_id = tm.id
        WHERE wi.project_id = $1
        GROUP BY tm.display_name, tm.github_username, wi.assignee_id
        ORDER BY total_items DESC
      `, [projectId]);

      const data = result.rows.map(row => ({
        assignee: row.assignee,
        total_items: parseInt(row.total_items),
        completed_items: parseInt(row.completed_items),
        in_progress_items: parseInt(row.in_progress_items),
        total_points: parseInt(row.total_points)
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AnalyticsService;