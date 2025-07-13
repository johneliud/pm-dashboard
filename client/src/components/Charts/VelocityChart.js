import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VelocityChart = ({ data }) => {
  if (!data || !data.weekly_data || data.weekly_data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Velocity</h3>
        <div className="text-center text-gray-500 py-8">
          No velocity data available. Complete some work items to see velocity trends.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Velocity</h3>
        <div className="text-sm text-gray-600">
          Avg: {data.average_velocity} points/week
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.weekly_data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="week"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
            formatter={(value, name) => [
              value, 
              name === 'completed_points' ? 'Story Points' : 'Items'
            ]}
          />
          <Legend />
          <Bar dataKey="completed_points" fill="#3b82f6" name="Points Completed" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-600">
          <span className="font-medium">Current Trend:</span> {
            data.weekly_data.length >= 2 
              ? data.weekly_data[data.weekly_data.length - 1].completed_points > data.weekly_data[data.weekly_data.length - 2].completed_points
                ? '📈 Increasing'
                : '📉 Decreasing'
              : 'Not enough data'
          }
        </div>
        <div className="text-gray-600">
          <span className="font-medium">Last Week:</span> {
            data.weekly_data.length > 0 
              ? `${data.weekly_data[data.weekly_data.length - 1].completed_points} points`
              : 'No data'
          }
        </div>
      </div>
    </div>
  );
};

export default VelocityChart;