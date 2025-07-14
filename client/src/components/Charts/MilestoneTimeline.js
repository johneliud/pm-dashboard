import React from 'react';

const MilestoneTimeline = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Timeline</h3>
        <div className="text-center text-gray-500 py-8">
          No milestone data available. Add milestones to your work items to see timeline.
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'on_track': return 'bg-blue-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'on_track': return 'On Track';
      case 'at_risk': return 'At Risk';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Milestone Timeline</h3>
        <div className="text-sm text-gray-600">
          {data.length} milestones
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((milestone, index) => (
          <div key={index} className="relative">
            {/* Timeline line */}
            {index < data.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            <div className="flex items-start gap-4">
              {/* Status indicator */}
              <div className={`w-8 h-8 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Milestone content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{milestone.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(milestone.status)}`}>
                      {getStatusText(milestone.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Progress</div>
                      <div className="font-medium">{milestone.completion_percentage}%</div>
                      <div className="text-xs text-gray-500">
                        {milestone.completed_items}/{milestone.total_items} items
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600">Start Date</div>
                      <div className="font-medium">{formatDate(milestone.earliest_start)}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600">End Date</div>
                      <div className="font-medium">{formatDate(milestone.latest_end)}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600">Avg. Completion</div>
                      <div className="font-medium">
                        {milestone.avg_completion_days ? `${milestone.avg_completion_days} days` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(milestone.status)}`}
                        style={{ width: `${milestone.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {data.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {data.filter(m => m.status === 'on_track').length}
            </div>
            <div className="text-gray-600">On Track</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {data.filter(m => m.status === 'at_risk').length}
            </div>
            <div className="text-gray-600">At Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {data.filter(m => m.status === 'overdue').length}
            </div>
            <div className="text-gray-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneTimeline;