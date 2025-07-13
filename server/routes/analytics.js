const express = require('express');
const pool = require('../db/connection');
const AnalyticsService = require('../services/analyticsService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Verify project ownership middleware
const verifyProjectOwnership = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    next();
  } catch (error) {
    console.error('Project verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project progress
router.get('/:projectId/progress', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    const result = await analyticsService.getProjectProgress(projectId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get status distribution
router.get('/:projectId/status-distribution', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    const result = await analyticsService.getStatusDistribution(projectId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get status distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team velocity
router.get('/:projectId/velocity', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    const result = await analyticsService.getTeamVelocity(projectId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get team velocity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get burndown chart data
router.get('/:projectId/burndown', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    const result = await analyticsService.getBurndownData(projectId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get burndown data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team workload
router.get('/:projectId/workload', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    const result = await analyticsService.getTeamWorkload(projectId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get team workload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project overview (combines multiple metrics)
router.get('/:projectId/overview', authenticateToken, verifyProjectOwnership, async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyticsService = new AnalyticsService();
    
    // Get all metrics in parallel
    const [progress, statusDist, velocity, workload, burndown] = await Promise.all([
      analyticsService.getProjectProgress(projectId),
      analyticsService.getStatusDistribution(projectId),
      analyticsService.getTeamVelocity(projectId),
      analyticsService.getTeamWorkload(projectId),
      analyticsService.getBurndownData(projectId)
    ]);

    const overview = {
      progress: progress.success ? progress.data : null,
      status_distribution: statusDist.success ? statusDist.data : null,
      velocity: velocity.success ? velocity.data : null,
      team_workload: workload.success ? workload.data : null,
      burndown: burndown.success ? burndown.data : null
    };

    res.json(overview);
  } catch (error) {
    console.error('Get project overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;