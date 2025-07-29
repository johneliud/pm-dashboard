import React, { useMemo } from 'react';

/**
 * Milestone Progress Component
 * 
 * Displays milestone timeline with completion percentages and target dates.
 * Shows visual progress indicators and status for each milestone.
 */
const MilestoneProgress = ({ data }) => {
  
  /**
   * Process milestone data with enhanced calculations
   */
  const processedMilestones = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((milestone) => {
      /**
       * CALCULATION: Milestone Status Determination
       * 
       * Status logic:
       * - completed: 100% completion
       * - overdue: Past end date with <100% completion
       * - at_risk: Behind expected progress by >20%
       * - on_track: Meeting or exceeding expected progress
       */
      const now = Date.now();
      const endDate = milestone.latest_end ? new Date(milestone.latest_end).getTime() : null;
      const startDate = milestone.earliest_start ? new Date(milestone.earliest_start).getTime() : null;
      const completionRate = milestone.completion_percentage || 0;
      
      let status = 'unknown';
      let expectedProgress = 0;
      
      if (completionRate >= 100) {
        status = 'completed';
      } else if (endDate && now > endDate) {
        status = 'overdue';
      } else if (startDate && endDate) {
        // Calculate expected progress based on time elapsed
        const totalDuration = endDate - startDate;
        const elapsed = Math.max(0, now - startDate);
        expectedProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
        
        if (completionRate < expectedProgress - 20) {
          status = 'at_risk';
        } else {
          status = 'on_track';
        }
      } else {
        status = completionRate > 0 ? 'on_track' : 'not_started';
      }

      /**
       * CALCULATION: Days remaining/overdue
       */
      let daysInfo = null;
      if (endDate) {
        const daysDiff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          daysInfo = { type: 'remaining', days: daysDiff };
        } else {
          daysInfo = { type: 'overdue', days: Math.abs(daysDiff) };
        }
      }

      return {
        ...milestone,
        status,
        expectedProgress: Math.round(expectedProgress),
        daysInfo
      };
    }).sort((a, b) => {
      // Sort by end date, then by start date
      const aEnd = a.latest_end ? new Date(a.latest_end) : new Date('2099-12-31');
      const bEnd = b.latest_end ? new Date(b.latest_end) : new Date('2099-12-31');
      return aEnd - bEnd;
    });
  }, [data]);

  /**
   * Get status-specific styling
   */
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '✅',
          label: 'Completed'
        };
      case 'on_track':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: '🎯',
          label: 'On Track'
        };
      case 'at_risk':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: '⚠️',
          label: 'At Risk'
        };
      case 'overdue':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: '🚨',
          label: 'Overdue'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⏸️',
          label: 'Not Started'
        };
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Calculate overall milestone summary
   */
  const summary = useMemo(() => {
    if (processedMilestones.length === 0) return null;

    const completed = processedMilestones.filter(m => m.status === 'completed').length;
    const onTrack = processedMilestones.filter(m => m.status === 'on_track').length;
    const atRisk = processedMilestones.filter(m => m.status === 'at_risk').length;
    const overdue = processedMilestones.filter(m => m.status === 'overdue').length;
    
    const totalCompletion = processedMilestones.reduce((sum, m) => sum + (m.completion_percentage || 0), 0);
    const averageCompletion = Math.round(totalCompletion / processedMilestones.length);

    return {
      total: processedMilestones.length,
      completed,
      onTrack,
      atRisk,
      overdue,
      averageCompletion
    };
  }, [processedMilestones]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Milestone Progress</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>No milestones found.</p>
          <p className="text-sm mt-1">Add milestones to your work items to track progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with Summary */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Milestone Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {summary?.total} milestones • {summary?.averageCompletion}% average completion
          </p>
        </div>
        
        {summary && (
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              {summary.completed} completed
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {summary.onTrack} on track
            </span>
            {(summary.atRisk > 0 || summary.overdue > 0) && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                {summary.atRisk + summary.overdue} need attention
              </span>
            )}
          </div>
        )}
      </div>

      {/* Milestone Timeline */}
      <div className="space-y-4">
        {processedMilestones.map((milestone, index) => {
          const statusConfig = getStatusConfig(milestone.status);
          
          return (
            <div key={index} className="relative">
              {/* Timeline connector */}
              {index < processedMilestones.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
              )}
              
              <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className={`w-8 h-8 rounded-full ${statusConfig.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 min-w-0">
                  <div className={`rounded-lg border p-4 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {milestone.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 ${statusConfig.textColor} font-medium`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                          {milestone.daysInfo && (
                            <span className={`text-xs ${
                              milestone.daysInfo.type === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {milestone.daysInfo.type === 'overdue' ? 
                                `${milestone.daysInfo.days} days overdue` :
                                `${milestone.daysInfo.days} days remaining`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {milestone.completion_percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {milestone.completed_items || 0}/{milestone.total_items || 0} items
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${statusConfig.color}`}
                          style={{ width: `${milestone.completion_percentage || 0}%` }}
                        ></div>
                      </div>
                      
                      {/* Expected progress indicator */}
                      {milestone.expectedProgress > 0 && milestone.status !== 'completed' && (
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          Expected: {milestone.expectedProgress}% 
                          {milestone.completion_percentage < milestone.expectedProgress && (
                            <span className="text-red-600 dark:text-red-400 ml-1">
                              ({(milestone.expectedProgress - milestone.completion_percentage).toFixed(0)}% behind)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Timeline info */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Start Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(milestone.earliest_start)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">End Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(milestone.latest_end)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-lg font-bold text-green-600">{summary.completed}</div>
              <div className="text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{summary.onTrack}</div>
              <div className="text-gray-600 dark:text-gray-400">On Track</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{summary.atRisk}</div>
              <div className="text-gray-600 dark:text-gray-400">At Risk</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{summary.overdue}</div>
              <div className="text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneProgress;