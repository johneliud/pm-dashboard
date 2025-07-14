import React, { useState, useEffect } from 'react';

const AnalyticsFilters = ({ onFiltersChange, teamMembers = [], milestones = [] }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assignee: '',
    status: '',
    milestone: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    'Done',
    'Completed', 
    'Closed',
    'In Progress',
    'In Review',
    'Todo',
    'Backlog',
    'New'
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      assignee: '',
      status: '',
      milestone: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const getPresetDateRange = (preset) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (preset) {
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'thisyear':
        startDate.setMonth(0, 1);
        break;
      default:
        return;
    }
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Analytics Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Date Range Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Date Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'last7days', label: 'Last 7 Days' },
                { key: 'last30days', label: 'Last 30 Days' },
                { key: 'last3months', label: 'Last 3 Months' },
                { key: 'thisyear', label: 'This Year' }
              ].map(preset => (
                <button
                  key={preset.key}
                  onClick={() => getPresetDateRange(preset.key)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Other Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignee Filter */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                id="assignee"
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Assignees</option>
                {teamMembers.map((member, index) => (
                  <option key={index} value={member.id}>
                    {member.display_name || member.github_username}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Milestone Filter */}
            <div>
              <label htmlFor="milestone" className="block text-sm font-medium text-gray-700 mb-1">
                Milestone
              </label>
              <select
                id="milestone"
                value={filters.milestone}
                onChange={(e) => handleFilterChange('milestone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Milestones</option>
                {milestones.map((milestone, index) => (
                  <option key={index} value={milestone}>
                    {milestone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.startDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                To: {filters.endDate}
              </span>
            )}
            {filters.assignee && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Assignee: {teamMembers.find(m => m.id.toString() === filters.assignee)?.display_name || 'Unknown'}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Status: {filters.status}
              </span>
            )}
            {filters.milestone && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Milestone: {filters.milestone}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;