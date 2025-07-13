import React from 'react';

const ProgressCard = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
        <div className="text-center text-gray-500 py-8">
          No progress data available.
        </div>
      </div>
    );
  }

  const { progress_percentage, total_items, completed_items, in_progress_items, todo_items } = data;

  // Determine progress status
  let statusColor = 'bg-gray-500';
  let statusText = 'Unknown';
  
  if (progress_percentage >= 90) {
    statusColor = 'bg-green-500';
    statusText = 'Excellent';
  } else if (progress_percentage >= 70) {
    statusColor = 'bg-blue-500';
    statusText = 'On Track';
  } else if (progress_percentage >= 50) {
    statusColor = 'bg-yellow-500';
    statusText = 'Fair';
  } else if (progress_percentage >= 25) {
    statusColor = 'bg-orange-500';
    statusText = 'Behind';
  } else {
    statusColor = 'bg-red-500';
    statusText = 'At Risk';
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}>
          {statusText}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Completion</span>
          <span>{progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${statusColor}`}
            style={{ width: `${progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total_items}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completed_items}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{in_progress_items}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{todo_items}</div>
          <div className="text-sm text-gray-600">To Do</div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {completed_items > 0 && total_items > 0 && (
            <div>
              <span className="font-medium">Completion Rate:</span> {
                Math.round((completed_items / total_items) * 100)
              }% of all items completed
            </div>
          )}
          {in_progress_items > 0 && (
            <div className="mt-1">
              <span className="font-medium">Active Work:</span> {in_progress_items} items currently in progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;