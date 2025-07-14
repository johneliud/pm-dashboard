import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnhancedWorkload = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Team Workload</h3>
        <div className="text-center text-gray-500 py-8">
          No workload data available. Assign work items to team members to see distribution.
        </div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Prepare chart data
  const chartData = data.map(member => ({
    name: member.assignee.length > 12 ? member.assignee.substring(0, 12) + '...' : member.assignee,
    fullName: member.assignee,
    completed: member.completed_points,
    remaining: member.total_points - member.completed_points
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const memberData = data.find(m => m.assignee === payload[0].payload.fullName);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.fullName}</p>
          <p className="text-sm text-blue-600">Completed: {payload[0].value} points</p>
          <p className="text-sm text-gray-600">Remaining: {payload[1].value} points</p>
          {memberData && (
            <div className="mt-2 text-xs">
              <p>Completion Rate: {memberData.completion_rate}%</p>
              <p>Risk Level: {memberData.workload_risk}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Enhanced Team Workload</h3>
        <div className="text-sm text-gray-600">
          {data.length} team members
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed Points" />
            <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining Points" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Team Member Cards */}
      <div className="space-y-4">
        {data.map((member, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{member.assignee}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(member.workload_risk)}`}>
                  {getRiskIcon(member.workload_risk)} {member.workload_risk} risk
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{member.completion_rate}%</div>
                <div className="text-xs text-gray-600">completion</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${member.completion_rate}%` }}
                ></div>
              </div>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{member.total_items}</div>
                <div className="text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{member.completed_items}</div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{member.in_progress_items}</div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-600">{member.todo_items}</div>
                <div className="text-gray-600">To Do</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{member.total_points}</div>
                <div className="text-gray-600">Total Points</div>
              </div>
            </div>
            
            {/* Risk indicators */}
            {(member.stale_items > 0 || member.avg_in_progress_days > 5) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 text-xs">
                  {member.stale_items > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                      {member.stale_items} stale items (7+ days)
                    </span>
                  )}
                  {member.avg_in_progress_days > 5 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Avg {member.avg_in_progress_days} days in progress
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, m) => sum + m.total_points, 0)}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {data.reduce((sum, m) => sum + m.completed_points, 0)}
            </div>
            <div className="text-gray-600">Completed Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {data.filter(m => m.workload_risk === 'high').length}
            </div>
            <div className="text-gray-600">High Risk Members</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(data.reduce((sum, m) => sum + m.completion_rate, 0) / data.length)}%
            </div>
            <div className="text-gray-600">Avg Completion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkload;