import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CompletionRateCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completion Rate</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>No completion data available</p>
        </div>
      </div>
    );
  }

  // Calculate overall completion metrics
  const totalItems = data.reduce((sum, member) => sum + member.total_items, 0);
  const completedItems = data.reduce((sum, member) => sum + member.completed_items, 0);
  const overallCompletionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Calculate team average completion rate
  const teamAverage = data.length > 0 ? Math.round(
    data.reduce((sum, member) => {
      const memberRate = member.total_items > 0 ? (member.completed_items / member.total_items) * 100 : 0;
      return sum + memberRate;
    }, 0) / data.length
  ) : 0;

  // Create pie chart data
  const pieData = [
    { name: 'Completed', value: completedItems, color: '#10B981' },
    { name: 'In Progress', value: data.reduce((sum, member) => sum + member.in_progress_items, 0), color: '#F59E0B' },
    { name: 'Todo', value: totalItems - completedItems - data.reduce((sum, member) => sum + member.in_progress_items, 0), color: '#6B7280' }
  ].filter(item => item.value > 0);

  const getCompletionStatus = (rate) => {
    if (rate >= 90) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (rate >= 75) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (rate >= 60) return { text: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Needs Attention', color: 'text-red-600 dark:text-red-400' };
  };

  const status = getCompletionStatus(overallCompletionRate);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-2 rounded shadow-lg border border-gray-600">
          <p className="text-white text-sm">
            {data.name}: {data.value} items
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completion Rate</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metrics */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {overallCompletionRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Completion</div>
            <div className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-green-600 dark:text-green-400">{completedItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Team Average</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{teamAverage}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallCompletionRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Shows percentage of committed work actually finished across the team
      </div>
    </div>
  );
};

export default CompletionRateCard;