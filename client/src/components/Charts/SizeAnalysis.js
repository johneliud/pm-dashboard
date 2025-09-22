import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SIZE_COLORS = {
  'XS': '#10b981',
  'S': '#3b82f6',
  'M': '#f59e0b',
  'L': '#ef4444',
  'XL': '#7c3aed',
  '1': '#10b981',
  '2': '#3b82f6', 
  '3': '#f59e0b',
  '5': '#ef4444',
  '8': '#7c3aed',
  '13': '#dc2626',
  'None': '#6b7280',
  'Unknown': '#9ca3af'
};

const getSizeColor = (size) => {
  return SIZE_COLORS[size] || '#6b7280';
};

const SizeAnalysis = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Size Analysis</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No size data available. Sync your project to see work item size distribution.
        </div>
      </div>
    );
  }

  const totalItems = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalItems) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">Size: {label}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Size Analysis</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {totalItems} items
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={getSizeColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getSizeColor(item.name) }}
              ></div>
              <span className="text-gray-700 dark:text-gray-300">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SizeAnalysis;