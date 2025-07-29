import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const TeamWorkloadChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">👥</div>
        <p>No workload data available</p>
      </div>
    );
  }

  const chartData = data.map(member => ({
    name: member.assignee.length > 15 ? member.assignee.substring(0, 15) + '...' : member.assignee,
    fullName: member.assignee,
    'Total Items': member.total_items,
    'Completed': member.completed_items,
    'In Progress': member.in_progress_items,
    'Story Points': member.total_points,
    completionRate: member.total_items > 0 ? Math.round((member.completed_items / member.total_items) * 100) : 0
  }));

  const getRiskColor = (completionRate) => {
    if (completionRate >= 80) return '#10B981'; // Green
    if (completionRate >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-blue-300">Total Items: {data['Total Items']}</p>
          <p className="text-green-300">Completed: {data.Completed}</p>
          <p className="text-yellow-300">In Progress: {data['In Progress']}</p>
          <p className="text-purple-300">Story Points: {data['Story Points']}</p>
          <p className="text-gray-300">Completion Rate: {data.completionRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Workload Distribution</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data.length} team members
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="In Progress" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
          <Bar 
            dataKey="Total Items" 
            fill="transparent" 
            stroke="#6B7280" 
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slice(0, 4).map((member, index) => {
            const completionRate = member.total_items > 0 ? Math.round((member.completed_items / member.total_items) * 100) : 0;
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {member.assignee}
                </div>
                <div 
                  className="text-sm font-medium"
                  style={{ color: getRiskColor(completionRate) }}
                >
                  {completionRate}% complete
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Stacked bars show completed (green) and in-progress (yellow) items per team member
      </div>
    </div>
  );
};

export default TeamWorkloadChart;