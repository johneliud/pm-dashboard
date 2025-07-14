const pool = require('../db/connection');

class AnalyticsService {
  // Get project progress percentage
  async getProjectProgress(projectId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          COUNT(CASE WHEN status IN ('In Progress', 'In Review') THEN 1 END) as in_progress_items,
          COUNT(CASE WHEN status IN ('Todo', 'Backlog', 'New') THEN 1 END) as todo_items
        FROM work_items 
        WHERE project_id = $1
      `,
        [projectId]
      );

      const data = result.rows[0];
      const totalItems = parseInt(data.total_items);
      const completedItems = parseInt(data.completed_items);

      const progressPercentage =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        success: true,
        data: {
          total_items: totalItems,
          completed_items: completedItems,
          in_progress_items: parseInt(data.in_progress_items),
          todo_items: parseInt(data.todo_items),
          progress_percentage: progressPercentage,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get status distribution for pie chart
  async getStatusDistribution(projectId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          status,
          COUNT(*) as count
        FROM work_items 
        WHERE project_id = $1 
        GROUP BY status
        ORDER BY count DESC
      `,
        [projectId]
      );

      const data = result.rows.map((row) => ({
        name: row.status || 'Unknown',
        value: parseInt(row.count),
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
      const result = await pool.query(
        `
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
      `,
        [projectId]
      );

      const data = result.rows
        .map((row) => ({
          week: row.week.toISOString().split('T')[0],
          completed_points: parseInt(row.completed_points) || 0,
          completed_items: parseInt(row.completed_items) || 0,
        }))
        .reverse(); // Show oldest to newest

      // Calculate average velocity
      const totalPoints = data.reduce(
        (sum, week) => sum + week.completed_points,
        0
      );
      const averageVelocity =
        data.length > 0 ? Math.round(totalPoints / data.length) : 0;

      return {
        success: true,
        data: {
          weekly_data: data,
          average_velocity: averageVelocity,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get burndown chart data (simplified version)
  async getBurndownData(projectId) {
    try {
      // Get total story points and items
      const totalResult = await pool.query(
        `
        SELECT 
          SUM(COALESCE(size_estimate, 1)) as total_points,
          COUNT(*) as total_items
        FROM work_items 
        WHERE project_id = $1
      `,
        [projectId]
      );

      const totalPoints = parseInt(totalResult.rows[0].total_points) || 0;
      const totalItems = parseInt(totalResult.rows[0].total_items) || 0;

      // Get completion data over last 4 weeks
      const completionResult = await pool.query(
        `
        SELECT 
          DATE(updated_at) as date,
          SUM(COALESCE(size_estimate, 1)) as points_completed
        FROM work_items 
        WHERE project_id = $1 
          AND status IN ('Done', 'Completed', 'Closed')
          AND updated_at >= NOW() - INTERVAL '4 weeks'
        GROUP BY DATE(updated_at)
        ORDER BY date
      `,
        [projectId]
      );

      // Calculate remaining points over time
      let remainingPoints = totalPoints;
      const burndownData = [];

      // Add starting point
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      burndownData.push({
        date: fourWeeksAgo.toISOString().split('T')[0],
        remaining_points: totalPoints,
        ideal_remaining: totalPoints,
      });

      // Process completion data
      completionResult.rows.forEach((row, index) => {
        remainingPoints -= parseInt(row.points_completed);
        const daysElapsed = index + 1;
        const idealRemaining = Math.max(
          0,
          totalPoints - (totalPoints * daysElapsed) / 28
        );

        burndownData.push({
          date: row.date.toISOString().split('T')[0],
          remaining_points: Math.max(0, remainingPoints),
          ideal_remaining: Math.round(idealRemaining),
        });
      });

      return {
        success: true,
        data: {
          total_points: totalPoints,
          total_items: totalItems,
          burndown_data: burndownData,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get team workload distribution
  async getTeamWorkload(projectId) {
    try {
      const result = await pool.query(
        `
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
      `,
        [projectId]
      );

      const data = result.rows.map((row) => ({
        assignee: row.assignee,
        total_items: parseInt(row.total_items),
        completed_items: parseInt(row.completed_items),
        in_progress_items: parseInt(row.in_progress_items),
        total_points: parseInt(row.total_points),
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get milestone timeline data
  async getMilestoneTimeline(projectId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          milestone,
          COUNT(*) as total_items,
          COUNT(CASE WHEN status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          MIN(start_date) as earliest_start,
          MAX(end_date) as latest_end,
          AVG(CASE WHEN status IN ('Done', 'Completed', 'Closed') AND end_date IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (updated_at::date - start_date))/86400 
              ELSE NULL END) as avg_completion_days
        FROM work_items 
        WHERE project_id = $1 AND milestone IS NOT NULL
        GROUP BY milestone
        ORDER BY earliest_start, milestone
      `,
        [projectId]
      );

      const milestones = result.rows.map((row) => ({
        name: row.milestone,
        total_items: parseInt(row.total_items),
        completed_items: parseInt(row.completed_items),
        completion_percentage: Math.round(
          (parseInt(row.completed_items) / parseInt(row.total_items)) * 100
        ),
        earliest_start: row.earliest_start,
        latest_end: row.latest_end,
        avg_completion_days: row.avg_completion_days
          ? Math.round(parseFloat(row.avg_completion_days))
          : null,
        status: this.getMilestoneStatus(row),
      }));

      return { success: true, data: milestones };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper method to determine milestone status
  getMilestoneStatus(milestone) {
    const completionRate =
      parseInt(milestone.completed_items) / parseInt(milestone.total_items);
    const today = new Date();
    const endDate = milestone.latest_end
      ? new Date(milestone.latest_end)
      : null;

    if (completionRate >= 1.0) return 'completed';
    if (endDate && endDate < today && completionRate < 1.0) return 'overdue';
    if (
      endDate &&
      endDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      completionRate < 0.8
    )
      return 'at_risk';
    return 'on_track';
  }

  // Enhanced team workload with risk analysis
  async getEnhancedTeamWorkload(projectId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          COALESCE(tm.display_name, tm.github_username, 'Unassigned') as assignee,
          COUNT(*) as total_items,
          COUNT(CASE WHEN wi.status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          COUNT(CASE WHEN wi.status IN ('In Progress', 'In Review') THEN 1 END) as in_progress_items,
          COUNT(CASE WHEN wi.status IN ('Todo', 'Backlog', 'New') THEN 1 END) as todo_items,
          SUM(COALESCE(wi.size_estimate, 1)) as total_points,
          SUM(CASE WHEN wi.status IN ('Done', 'Completed', 'Closed') 
              THEN COALESCE(wi.size_estimate, 1) ELSE 0 END) as completed_points,
          AVG(CASE WHEN wi.status IN ('In Progress', 'In Review') AND wi.updated_at > NOW() - INTERVAL '7 days'
              THEN EXTRACT(EPOCH FROM (NOW() - wi.updated_at))/86400 
              ELSE NULL END) as avg_in_progress_days,
          COUNT(CASE WHEN wi.status IN ('In Progress', 'In Review') 
                     AND wi.updated_at < NOW() - INTERVAL '7 days' THEN 1 END) as stale_items
        FROM work_items wi
        LEFT JOIN team_members tm ON wi.assignee_id = tm.id
        WHERE wi.project_id = $1
        GROUP BY tm.display_name, tm.github_username, wi.assignee_id
        ORDER BY total_items DESC
      `,
        [projectId]
      );

      const data = result.rows.map((row) => {
        const completionRate =
          parseInt(row.completed_items) / parseInt(row.total_items);
        const workloadRisk = this.calculateWorkloadRisk(row);

        return {
          assignee: row.assignee,
          total_items: parseInt(row.total_items),
          completed_items: parseInt(row.completed_items),
          in_progress_items: parseInt(row.in_progress_items),
          todo_items: parseInt(row.todo_items),
          total_points: parseInt(row.total_points),
          completed_points: parseInt(row.completed_points),
          completion_rate: Math.round(completionRate * 100),
          avg_in_progress_days: row.avg_in_progress_days
            ? Math.round(parseFloat(row.avg_in_progress_days))
            : null,
          stale_items: parseInt(row.stale_items),
          workload_risk: workloadRisk,
        };
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Calculate workload risk level
  calculateWorkloadRisk(member) {
    const totalItems = parseInt(member.total_items);
    const inProgressItems = parseInt(member.in_progress_items);
    const staleItems = parseInt(member.stale_items);
    const avgDays = member.avg_in_progress_days
      ? parseFloat(member.avg_in_progress_days)
      : 0;

    // High risk indicators
    if (staleItems > 2 || avgDays > 10 || inProgressItems > 5) return 'high';
    if (staleItems > 0 || avgDays > 5 || inProgressItems > 3) return 'medium';
    return 'low';
  }
}

module.exports = AnalyticsService;
