import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CycleTimeCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cycle Time Analysis</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">⏱️</div>
          <p>No cycle time data available</p>
        </div>
      </div>
    );
  }

  // Calculate cycle time metrics
  const teamData = data.map(member => ({
    name: member.assignee.length > 12 ? member.assignee.substring(0, 12) + '...' : member.assignee,
    fullName: member.assignee,
    avgCycleTime: member.avg_in_progress_days || 0,
    staleItems: member.stale_items || 0,
    workloadRisk: member.workload_risk || 'low'
  }));

  // Calculate team averages
  const totalCycleTime = teamData.reduce((sum, member) => sum + member.avgCycleTime, 0);
  const teamAvgCycleTime = teamData.length > 0 ? Math.round((totalCycleTime / teamData.length) * 10) / 10 : 0;
  const totalStaleItems = teamData.reduce((sum, member) => sum + member.staleItems, 0);

  // Risk analysis
  const highRiskMembers = teamData.filter(member => member.workloadRisk === 'high').length;
  const mediumRiskMembers = teamData.filter(member => member.workloadRisk === 'medium').length;

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getRiskStatus = () => {
    if (highRiskMembers > 0) return { text: 'High Risk', color: 'text-red-600 dark:text-red-400' };
    if (mediumRiskMembers > 0) return { text: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Low Risk', color: 'text-green-600 dark:text-green-400' };
  };

  const riskStatus = getRiskStatus();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-blue-300">Avg Cycle Time: {data.avgCycleTime} days</p>
          <p className="text-yellow-300">Stale Items: {data.staleItems}</p>
          <p className="text-purple-300">Risk Level: {data.workloadRisk}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cycle Time Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamAvgCycleTime}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Days</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">In Progress → Done</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Team Status</span>
              <span className={`text-sm font-medium ${riskStatus.color}`}>
                {riskStatus.text}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stale Items</span>
              <span className={`font-medium ${totalStaleItems > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {totalStaleItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
              <span className="font-medium text-red-600 dark:text-red-400">{highRiskMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{mediumRiskMembers}</span>
            </div>
          </div>
        </div>
        
        {/* Cycle Time Bar Chart */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={11}
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="avgCycleTime" 
                fill={(entry) => getRiskColor(entry.workloadRisk)}
                radius={[4, 4, 0, 0]}
              >
                {teamData.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={getRiskColor(entry.workloadRisk)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Risk Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-green-800 dark:text-green-200">Low Risk</div>
            <div className="text-green-600 dark:text-green-400 text-xs">≤ 5 days average</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-yellow-800 dark:text-yellow-200">Medium Risk</div>
            <div className="text-yellow-600 dark:text-yellow-400 text-xs">5-10 days average</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-red-800 dark:text-red-200">High Risk</div>
            <div className="text-red-600 dark:text-red-400 text-xs">&gt; 10 days average</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Average time from "In Progress" to "Done" status. Items stale for &gt;7 days require attention.
      </div>
    </div>
  );
};

export default CycleTimeCard;