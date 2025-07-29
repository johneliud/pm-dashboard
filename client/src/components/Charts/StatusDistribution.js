import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  'Done': '#10b981',
  'Completed': '#10b981', 
  'Closed': '#10b981',
  'In Progress': '#3b82f6',
  'In Review': '#8b5cf6',
  'Todo': '#6b7280',
  'Backlog': '#6b7280',
  'New': '#f59e0b',
  'Unknown': '#ef4444'
};

const getStatusColor = (status) => {
  return COLORS[status] || '#6b7280';
};

const StatusDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No status data available. Sync your project to see work item distribution.
        </div>
      </div>
    );
  }

  const totalItems = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalItems) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} items ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status Distribution</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {totalItems} items
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(item.name) }}
              ></div>
              <span className="text-gray-700 dark:text-gray-300">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusDistribution;