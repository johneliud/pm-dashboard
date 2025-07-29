import React from 'react';

/**
 * Team Performance Metrics Component
 * 
 * Primary Value: Understand team velocity and productivity trends
 * 
 * Key Features:
 * 1. Velocity Chart - Story points or tasks completed per sprint (last 6 sprints)
 * 2. Team Workload Distribution - Visual breakdown of work assigned per team member
 * 3. Completion Rate - Percentage of committed work actually finished
 * 4. Cycle Time - Average time from "In Progress" to "Done" status
 * 
 * TODO: Implement comprehensive team performance analytics
 */
const TeamPerformance = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance Metrics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Understand team velocity and productivity trends
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Team performance metrics including velocity charts, workload distribution, and cycle time analysis.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This feature will include:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li>• Velocity tracking across sprints</li>
            <li>• Team workload distribution</li>
            <li>• Completion rate analysis</li>
            <li>• Cycle time metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformance;