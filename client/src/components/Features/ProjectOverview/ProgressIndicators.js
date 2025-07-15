import React, { useMemo } from 'react';

/**
 * Progress Indicators Component
 * 
 * Displays key progress metrics and health indicators for the project.
 * Provides at-a-glance answers to "Where are we vs where we should be?"
 */
const ProgressIndicators = ({ data, riskData, project }) => {
  
  /**
   * Calculate comprehensive progress metrics with detailed documentation
   */
  const metrics = useMemo(() => {
    if (!data?.progress) {
      return {
        progressPercentage: 0,
        healthStatus: 'unknown',
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        todoItems: 0,
        riskLevel: 'unknown',
        riskScore: 0
      };
    }

    const {
      total_items,
      completed_items,
      in_progress_items,
      todo_items,
      progress_percentage
    } = data.progress;

    /**
     * CALCULATION 1: Progress Percentage
     * Formula: (Completed Items / Total Items) * 100
     * 
     * This gives us the actual completion rate based on work items.
     * Note: We use the backend-calculated value to ensure consistency
     * across all dashboard components.
     */
    const actualProgress = progress_percentage || 0;

    /**
     * CALCULATION 2: Expected Progress (Time-based)
     * 
     * If we have project timeline data, calculate where we should be
     * based on elapsed time vs total project duration.
     * 
     * Formula: (Days Elapsed / Total Project Days) * 100
     * 
     * For now, using simplified approach since we don't have explicit
     * project start/end dates. Future enhancement: Add project timeline tracking.
     */
    let expectedProgress = null;
    let timeBasedHealth = 'unknown';
    
    // Simplified time-based calculation using project creation date
    if (project?.created_at) {
      const projectStart = new Date(project.created_at);
      const now = new Date();
      const daysSinceStart = Math.floor((now - projectStart) / (1000 * 60 * 60 * 24));
      
      // Assume 30-day sprint cycles for expected progress calculation
      // This is a simplified approach - in real scenarios, use actual sprint/milestone dates
      const assumedProjectDuration = 90; // 90 days (3 sprints)
      expectedProgress = Math.min((daysSinceStart / assumedProjectDuration) * 100, 100);
      
      // Health determination based on actual vs expected progress
      const progressGap = actualProgress - expectedProgress;
      if (progressGap >= 10) timeBasedHealth = 'ahead';
      else if (progressGap >= -10) timeBasedHealth = 'on_track';
      else timeBasedHealth = 'behind';
    }

    /**
     * CALCULATION 3: Overall Health Status
     * 
     * Combines multiple factors to determine project health:
     * 1. Progress percentage (primary factor)
     * 2. Risk analysis data (velocity, blockers, overdue items)
     * 3. Time-based progress (if available)
     * 
     * Health Levels:
     * - excellent: >90% progress, low risk
     * - good: 70-90% progress, manageable risk
     * - warning: 50-70% progress or medium risk
     * - critical: <50% progress or high risk
     */
    let healthStatus = 'unknown';
    const riskLevel = riskData?.risk_level || 'unknown';
    
    if (actualProgress >= 90 && ['low', 'medium'].includes(riskLevel)) {
      healthStatus = 'excellent';
    } else if (actualProgress >= 70 && riskLevel !== 'critical') {
      healthStatus = 'good';
    } else if (actualProgress >= 50 || riskLevel === 'medium') {
      healthStatus = 'warning';
    } else {
      healthStatus = 'critical';
    }

    /**
     * CALCULATION 4: Completion Velocity
     * 
     * Items completed per day since project start.
     * Useful for forecasting completion dates.
     */
    let completionVelocity = 0;
    if (project?.created_at && completed_items > 0) {
      const projectStart = new Date(project.created_at);
      const now = new Date();
      const daysSinceStart = Math.floor((now - projectStart) / (1000 * 60 * 60 * 24));
      if (daysSinceStart > 0) {
        completionVelocity = (completed_items / daysSinceStart).toFixed(2);
      }
    }

    /**
     * CALCULATION 5: Estimated Completion
     * 
     * Based on current velocity, estimate days to complete remaining work.
     * Formula: Remaining Items / Current Velocity
     */
    let estimatedDaysToComplete = null;
    if (completionVelocity > 0 && todo_items > 0) {
      estimatedDaysToComplete = Math.ceil(todo_items / completionVelocity);
    }

    return {
      progressPercentage: actualProgress,
      expectedProgress,
      timeBasedHealth,
      healthStatus,
      totalItems: total_items || 0,
      completedItems: completed_items || 0,
      inProgressItems: in_progress_items || 0,
      todoItems: todo_items || 0,
      riskLevel: riskLevel,
      riskScore: riskData?.risk_score || 0,
      completionVelocity: parseFloat(completionVelocity),
      estimatedDaysToComplete
    };
  }, [data, riskData, project]);

  /**
   * Get color scheme for health status indicators
   */
  const getHealthColors = (status) => {
    switch (status) {
      case 'excellent':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: '🎯',
          label: 'Excellent'
        };
      case 'good':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: '✅',
          label: 'On Track'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: '⚠️',
          label: 'Needs Attention'
        };
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: '🚨',
          label: 'At Risk'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const healthColors = getHealthColors(metrics.healthStatus);

  if (!data?.progress) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Progress */}
      <div className={`rounded-lg border p-6 ${healthColors.bg} ${healthColors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-medium ${healthColors.text}`}>Overall Progress</h3>
          <span className="text-lg">{healthColors.icon}</span>
        </div>
        <div className={`text-2xl font-bold ${healthColors.text} mb-1`}>
          {metrics.progressPercentage.toFixed(1)}%
        </div>
        <div className={`text-xs ${healthColors.text} opacity-75`}>
          {healthColors.label}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2 opacity-50">
            <div 
              className="h-2 rounded-full bg-current transition-all duration-300"
              style={{ width: `${Math.min(metrics.progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Work Items Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Work Items</h3>
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {metrics.completedItems} / {metrics.totalItems}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {metrics.inProgressItems} in progress, {metrics.todoItems} remaining
        </div>
        
        {/* Mini Progress Breakdown */}
        <div className="mt-3 flex gap-1">
          <div 
            className="h-2 bg-green-500 rounded-l"
            style={{ width: `${(metrics.completedItems / metrics.totalItems) * 100}%` }}
          ></div>
          <div 
            className="h-2 bg-blue-500"
            style={{ width: `${(metrics.inProgressItems / metrics.totalItems) * 100}%` }}
          ></div>
          <div 
            className="h-2 bg-gray-300 dark:bg-gray-600 rounded-r"
            style={{ width: `${(metrics.todoItems / metrics.totalItems) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Level</h3>
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {metrics.riskScore}/100
        </div>
        <div className={`text-xs capitalize ${
          metrics.riskLevel === 'low' ? 'text-green-600' :
          metrics.riskLevel === 'medium' ? 'text-yellow-600' :
          metrics.riskLevel === 'high' ? 'text-orange-600' :
          metrics.riskLevel === 'critical' ? 'text-red-600' :
          'text-gray-600 dark:text-gray-400'
        }`}>
          {metrics.riskLevel.replace('_', ' ')} risk
        </div>
        
        {/* Risk Level Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.riskLevel === 'low' ? 'bg-green-500' :
                metrics.riskLevel === 'medium' ? 'bg-yellow-500' :
                metrics.riskLevel === 'high' ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${metrics.riskScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Velocity & Forecast */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Velocity</h3>
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {metrics.completionVelocity}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          items per day
        </div>
        
        {/* Forecast */}
        {metrics.estimatedDaysToComplete && (
          <div className="mt-2 text-xs">
            <span className="text-gray-600 dark:text-gray-400">Est. completion: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {metrics.estimatedDaysToComplete} days
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicators;