import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BurndownChart = ({ data }) => {
  if (!data || !data.burndown_data || data.burndown_data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sprint Burndown</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No burndown data available. Sync your project to see progress.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Burndown</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {data.total_points} points
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.burndown_data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value, name) => [
              value, 
              name === 'remaining_points' ? 'Actual Remaining' : 'Ideal Remaining'
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ideal_remaining" 
            stroke="#94a3b8" 
            strokeDasharray="5 5"
            name="Ideal"
          />
          <Line 
            type="monotone" 
            dataKey="remaining_points" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Shows ideal burndown vs actual remaining story points over time
      </div>
    </div>
  );
};

export default BurndownChart;