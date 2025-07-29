import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MilestoneTimeline from '../../Charts/MilestoneTimeline';

/**
 * Sprint/Milestone Tracking Component
 * 
 * Primary Value: Monitor sprint progress and deadline adherence
 * 
 * Key Features:
 * 1. Active Sprint Summary - Current sprint progress, days remaining, completion forecast
 * 2. Milestone Timeline - Visual timeline showing all milestones and their progress
 * 3. Scope Changes - Track added/removed work during active sprints
 * 4. Sprint Comparison - Compare current sprint performance to historical averages
 */
const SprintTracking = () => {
  const [sprintSummary, setSprintSummary] = useState(null);
  const [sprintComparison, setSprintComparison] = useState(null);
  const [scopeChanges, setScopeChanges] = useState(null);
  const [milestoneData, setMilestoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get project ID from URL or context
  const projectId = new URLSearchParams(window.location.search).get('projectId') || 
                   localStorage.getItem('selectedProjectId') || 
                   '1';

  useEffect(() => {
    const fetchSprintData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch all sprint data in parallel
        const [summaryResponse, comparisonResponse, scopeResponse, milestonesResponse] = await Promise.all([
          axios.get(`/api/analytics/${projectId}/sprint-summary`, config),
          axios.get(`/api/analytics/${projectId}/sprint-comparison`, config),
          axios.get(`/api/analytics/${projectId}/sprint-scope-changes`, config),
          axios.get(`/api/analytics/${projectId}/milestones`, config)
        ]);

        setSprintSummary(summaryResponse.data);
        setSprintComparison(comparisonResponse.data);
        setScopeChanges(scopeResponse.data);
        setMilestoneData(milestonesResponse.data);
        
      } catch (err) {
        console.error('Error fetching sprint data:', err);
        setError(err.response?.data?.error || 'Failed to load sprint data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSprintData();
    }
  }, [projectId]);

  const getSprintStatusConfig = (status) => {
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
      case 'behind_schedule':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: '🚨',
          label: 'Behind Schedule'
        };
      case 'overdue':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⏰',
          label: 'Overdue'
        };
      default:
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '⏸️',
          label: 'Not Started'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint & Milestone Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor sprint progress and deadline adherence
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint & Milestone Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor sprint progress and deadline adherence
        </p>
      </div>

      {/* Active Sprint Summary */}
      {sprintSummary ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Active Sprint</h2>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{sprintSummary.iteration_title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(sprintSummary.start_date)} - {formatDate(sprintSummary.end_date)}
              </p>
            </div>
            
            <div className="text-right">
              {(() => {
                const statusConfig = getSprintStatusConfig(sprintSummary.status);
                return (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{sprintSummary.completion_percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {sprintSummary.completed_points}/{sprintSummary.total_points} points
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{sprintSummary.days_remaining}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {sprintSummary.days_passed}/{sprintSummary.duration_days} days elapsed
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{sprintSummary.forecast_completion}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Forecast</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">Projected completion</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{sprintSummary.in_progress_items}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {sprintSummary.completed_items}/{sprintSummary.total_items} items done
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Work Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{sprintSummary.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${sprintSummary.completion_percentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Schedule Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{sprintSummary.schedule_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 bg-gray-400 rounded-full"
                  style={{ width: `${sprintSummary.schedule_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Sprint</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-600 dark:text-gray-400">No active sprint found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Configure iterations in your work items to track sprint progress.</p>
          </div>
        </div>
      )}

      {/* Sprint Comparison and Scope Changes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Comparison */}
        {sprintComparison && sprintComparison.sprints && sprintComparison.sprints.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sprint Comparison</h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{sprintComparison.averages.velocity}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Avg Velocity</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{sprintComparison.averages.completion_percentage}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Avg Completion</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sprintComparison.sprints.slice(-5).map((sprint, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {sprint.iteration_title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(sprint.start_date)}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {sprint.completion_percentage}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {sprint.velocity} vel
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sprint Comparison</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600 dark:text-gray-400">No sprint history available.</p>
            </div>
          </div>
        )}

        {/* Scope Changes */}
        {scopeChanges ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scope Changes</h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">+{scopeChanges.summary.added_count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Items Added</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{scopeChanges.summary.added_points}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Points Added</div>
                </div>
              </div>
            </div>

            {scopeChanges.added && scopeChanges.added.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scopeChanges.added.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Added {formatDate(item.added_date)}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600 ml-2">
                      +{item.size_estimate}
                    </div>
                  </div>
                ))}
                {scopeChanges.added.length > 5 && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-500">
                    And {scopeChanges.added.length - 5} more...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">No scope changes detected.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scope Changes</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600 dark:text-gray-400">No scope change data available.</p>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Timeline */}
      {milestoneData && milestoneData.length > 0 && (
        <MilestoneTimeline data={milestoneData} />
      )}
    </div>
  );
};

export default SprintTracking;