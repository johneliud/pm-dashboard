import React from 'react';

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
 * 
 * TODO: Implement comprehensive sprint tracking
 */
const SprintTracking = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint & Milestone Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor sprint progress and deadline adherence
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sprint tracking with active sprint summaries, scope change monitoring, and historical comparisons.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-green-800 dark:text-green-200">
            This feature will include:
          </p>
          <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
            <li>• Active sprint progress summary</li>
            <li>• Milestone timeline visualization</li>
            <li>• Scope change tracking</li>
            <li>• Sprint performance comparisons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SprintTracking;