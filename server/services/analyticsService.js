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

  // At-risk project identification
  async getAtRiskAnalysis(projectId) {
    try {
      const [velocityResult, blockerResult, overdueResult] = await Promise.all([
        // Velocity trend analysis
        pool.query(
          `
          SELECT 
            DATE_TRUNC('week', updated_at) as week,
            COUNT(*) as completed_items
          FROM work_items 
          WHERE project_id = $1 
            AND status IN ('Done', 'Completed', 'Closed')
            AND updated_at >= NOW() - INTERVAL '4 weeks'
          GROUP BY DATE_TRUNC('week', updated_at)
          ORDER BY week DESC
          LIMIT 4
        `,
          [projectId]
        ),

        // Blocker analysis
        pool.query(
          `
          SELECT 
            COUNT(*) as total_blocked,
            COUNT(CASE WHEN updated_at < NOW() - INTERVAL '3 days' THEN 1 END) as long_blocked
          FROM work_items 
          WHERE project_id = $1 
            AND (status ILIKE '%blocked%' OR status ILIKE '%waiting%')
        `,
          [projectId]
        ),

        // Overdue analysis
        pool.query(
          `
          SELECT 
            COUNT(*) as overdue_items,
            COUNT(CASE WHEN end_date < NOW() - INTERVAL '7 days' THEN 1 END) as severely_overdue
          FROM work_items 
          WHERE project_id = $1 
            AND end_date < NOW()
            AND status NOT IN ('Done', 'Completed', 'Closed')
        `,
          [projectId]
        ),
      ]);

      // Calculate risk factors
      const velocityTrend = this.analyzeVelocityTrend(velocityResult.rows);
      const blockerData = blockerResult.rows[0];
      const overdueData = overdueResult.rows[0];

      const riskFactors = {
        velocity_declining: velocityTrend.declining,
        velocity_trend: velocityTrend.trend,
        blocked_items: parseInt(blockerData.total_blocked),
        long_blocked_items: parseInt(blockerData.long_blocked),
        overdue_items: parseInt(overdueData.overdue_items),
        severely_overdue: parseInt(overdueData.severely_overdue),
      };

      const overallRisk = this.calculateOverallRisk(riskFactors);

      return {
        success: true,
        data: {
          risk_level: overallRisk.level,
          risk_score: overallRisk.score,
          risk_factors: riskFactors,
          recommendations: this.generateRecommendations(riskFactors),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Analyze velocity trend
  analyzeVelocityTrend(velocityData) {
    if (velocityData.length < 2)
      return { declining: false, trend: 'insufficient_data' };

    const recent = velocityData[0].completed_items;
    const previous = velocityData[1].completed_items;
    const declining = recent < previous * 0.8; // 20% decline threshold

    let trend = 'stable';
    if (recent > previous * 1.2) trend = 'improving';
    else if (declining) trend = 'declining';

    return { declining, trend };
  }

  // Calculate overall risk score
  calculateOverallRisk(factors) {
    let score = 0;

    // Velocity risks
    if (factors.velocity_declining) score += 30;
    if (factors.velocity_trend === 'declining') score += 20;

    // Blocker risks
    if (factors.blocked_items > 0) score += factors.blocked_items * 5;
    if (factors.long_blocked_items > 0)
      score += factors.long_blocked_items * 15;

    // Overdue risks
    if (factors.overdue_items > 0) score += factors.overdue_items * 10;
    if (factors.severely_overdue > 0) score += factors.severely_overdue * 25;

    let level = 'low';
    if (score >= 70) level = 'critical';
    else if (score >= 40) level = 'high';
    else if (score >= 20) level = 'medium';

    return { level, score: Math.min(score, 100) };
  }

  // Generate recommendations based on risk factors
  generateRecommendations(factors) {
    const recommendations = [];

    if (factors.velocity_declining || factors.velocity_trend === 'declining') {
      recommendations.push({
        type: 'velocity',
        priority: 'high',
        message:
          'Team velocity is declining. Consider reviewing workload and removing blockers.',
      });
    }

    if (factors.long_blocked_items > 0) {
      recommendations.push({
        type: 'blockers',
        priority: 'critical',
        message: `${factors.long_blocked_items} items have been blocked for over 3 days. Immediate attention required.`,
      });
    }

    if (factors.severely_overdue > 0) {
      recommendations.push({
        type: 'overdue',
        priority: 'high',
        message: `${factors.severely_overdue} items are severely overdue. Review scope and deadlines.`,
      });
    }

    if (factors.blocked_items > 0 && factors.long_blocked_items === 0) {
      recommendations.push({
        type: 'blockers',
        priority: 'medium',
        message: `${factors.blocked_items} items are currently blocked. Monitor closely to prevent delays.`,
      });
    }

    return recommendations;
  }

  // Get filtered analytics data
  async getFilteredAnalytics(projectId, filters = {}) {
    try {
      const { startDate, endDate, assignee, status, milestone } = filters;

      let whereClause = 'WHERE project_id = $1';
      let params = [projectId];
      let paramIndex = 2;

      if (startDate) {
        whereClause += ` AND updated_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND updated_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      if (assignee) {
        whereClause += ` AND assignee_id = $${paramIndex}`;
        params.push(assignee);
        paramIndex++;
      }

      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (milestone) {
        whereClause += ` AND milestone = $${paramIndex}`;
        params.push(milestone);
        paramIndex++;
      }

      const result = await pool.query(
        `
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status IN ('Done', 'Completed', 'Closed') THEN 1 END) as completed_items,
          AVG(COALESCE(size_estimate, 1)) as avg_size,
          COUNT(DISTINCT assignee_id) as unique_assignees,
          COUNT(DISTINCT milestone) as unique_milestones
        FROM work_items 
        ${whereClause}
      `,
        params
      );

      const data = result.rows[0];
      return {
        success: true,
        data: {
          total_items: parseInt(data.total_items),
          completed_items: parseInt(data.completed_items),
          completion_rate:
            data.total_items > 0
              ? Math.round((data.completed_items / data.total_items) * 100)
              : 0,
          avg_size: data.avg_size ? parseFloat(data.avg_size).toFixed(1) : 0,
          unique_assignees: parseInt(data.unique_assignees),
          unique_milestones: parseInt(data.unique_milestones),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AnalyticsService;
