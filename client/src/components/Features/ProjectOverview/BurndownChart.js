import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Enhanced Burndown Chart Component
 * 
 * Provides visual tracking of remaining work against ideal completion line.
 * Includes forecast projections and velocity-based predictions.
 * 
 * Key Calculations:
 * 1. Ideal Burndown Line - Linear progression from total points to zero
 * 2. Actual Burndown - Real remaining points over time
 * 3. Velocity-based Forecast - Projected completion based on current velocity
 * 4. Scope Change Detection - Identifies when work was added/removed
 */
const BurndownChart = ({ data }) => {
  
  /**
   * Process and enhance burndown data with additional calculations
   */
  const chartData = useMemo(() => {
    if (!data?.burndown_data || data.burndown_data.length === 0) {
      return [];
    }

    const burndownPoints = data.burndown_data;
    const totalPoints = data.total_points || 0;
    
    /**
     * CALCULATION 1: Ideal Burndown Line
     * 
     * Creates a perfect linear progression from total points to zero
     * over the sprint duration. This represents the "ideal" pace
     * if work was completed at a constant rate.
     * 
     * Formula: idealRemaining = totalPoints * (1 - dayIndex/totalDays)
     */
    const enhancedData = burndownPoints.map((point, index) => {
      const dayIndex = index;
      const totalDays = burndownPoints.length - 1;
      const idealRemaining = totalDays > 0 ? 
        Math.max(0, totalPoints - (totalPoints * dayIndex / totalDays)) : totalPoints;

      return {
        ...point,
        ideal_remaining: Math.round(idealRemaining),
        day_index: dayIndex,
        date_formatted: new Date(point.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });

    /**
     * CALCULATION 2: Velocity-based Forecast
     * 
     * Projects future completion based on recent velocity.
     * Uses the last 3-5 data points to calculate average daily velocity.
     */
    if (enhancedData.length >= 3) {
      // Calculate recent velocity (last 3 days)
      const recentData = enhancedData.slice(-3);
      const velocityCalculations = [];
      
      for (let i = 1; i < recentData.length; i++) {
        const pointsCompleted = recentData[i-1].remaining_points - recentData[i].remaining_points;
        velocityCalculations.push(pointsCompleted);
      }
      
      const averageVelocity = velocityCalculations.length > 0 ? 
        velocityCalculations.reduce((sum, v) => sum + v, 0) / velocityCalculations.length : 0;

      /**
       * CALCULATION 3: Forecast Projection
       * 
       * Extend the chart with forecasted data points based on current velocity.
       * This helps predict completion date and identify if sprint goal is achievable.
       */
      const lastPoint = enhancedData[enhancedData.length - 1];
      const remainingPoints = lastPoint.remaining_points;
      
      if (averageVelocity > 0 && remainingPoints > 0) {
        const daysToComplete = Math.ceil(remainingPoints / averageVelocity);
        const maxForecastDays = Math.min(daysToComplete, 10); // Limit forecast to 10 days
        
        for (let i = 1; i <= maxForecastDays; i++) {
          const forecastDate = new Date(lastPoint.date);
          forecastDate.setDate(forecastDate.getDate() + i);
          
          const forecastRemaining = Math.max(0, remainingPoints - (averageVelocity * i));
          
          enhancedData.push({
            date: forecastDate.toISOString(),
            date_formatted: forecastDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            remaining_points: null, // No actual data
            ideal_remaining: null,
            forecast_remaining: Math.round(forecastRemaining),
            day_index: lastPoint.day_index + i,
            is_forecast: true
          });
        }
      }
    }

    /**
     * CALCULATION 4: Scope Change Detection
     * 
     * Identifies days where remaining points increased (scope added)
     * or decreased more than expected (scope removed or bulk completion).
     */
    enhancedData.forEach((point, index) => {
      if (index > 0) {
        const previousPoint = enhancedData[index - 1];
        const pointsChanged = previousPoint.remaining_points - point.remaining_points;
        
        // Detect scope increases (negative change in remaining points reduction)
        if (pointsChanged < -2) { // Threshold for scope change detection
          point.scope_added = Math.abs(pointsChanged);
        }
        
        // Detect large completions (more than 2x normal velocity)
        const expectedVelocity = totalPoints / (enhancedData.length * 0.8); // Rough estimate
        if (pointsChanged > expectedVelocity * 2) {
          point.bulk_completion = pointsChanged;
        }
      }
    });

    return enhancedData;
  }, [data]);

  /**
   * Calculate sprint health indicators
   */
  const sprintHealth = useMemo(() => {
    if (chartData.length === 0) return null;

    const actualData = chartData.filter(d => !d.is_forecast && d.remaining_points !== null);
    if (actualData.length < 2) return null;

    const currentPoint = actualData[actualData.length - 1];
    const progressDays = actualData.length - 1;
    const totalDays = chartData.filter(d => !d.is_forecast).length - 1;
    
    const timeProgress = totalDays > 0 ? (progressDays / totalDays) * 100 : 0;
    const workProgress = data.total_points > 0 ? 
      ((data.total_points - currentPoint.remaining_points) / data.total_points) * 100 : 0;
    
    const progressGap = workProgress - timeProgress;
    
    let status = 'on_track';
    if (progressGap > 15) status = 'ahead';
    else if (progressGap < -15) status = 'behind';
    
    return {
      timeProgress: Math.round(timeProgress),
      workProgress: Math.round(workProgress),
      progressGap: Math.round(progressGap),
      status
    };
  }, [chartData, data]);

  /**
   * Custom tooltip for enhanced data display
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{data.date_formatted}</p>
        
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} points
          </p>
        ))}
        
        {data.scope_added && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            ⚠️ Scope added: +{data.scope_added} points
          </p>
        )}
        
        {data.bulk_completion && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            🎯 Major completion: {data.bulk_completion} points
          </p>
        )}
        
        {data.is_forecast && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            📈 Forecast based on current velocity
          </p>
        )}
      </div>
    );
  };

  if (!data || !data.burndown_data || data.burndown_data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sprint Burndown</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-4xl mb-2">📉</div>
          <p>No burndown data available.</p>
          <p className="text-sm mt-1">Sync your project to see sprint progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with Sprint Health */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Burndown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remaining: {chartData.find(d => !d.is_forecast && d.remaining_points !== null)?.remaining_points || 0} / {data.total_points} points
          </p>
        </div>
        
        {sprintHealth && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            sprintHealth.status === 'ahead' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            sprintHealth.status === 'behind' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
          }`}>
            {sprintHealth.status === 'ahead' ? '🚀 Ahead of Schedule' :
             sprintHealth.status === 'behind' ? '⚠️ Behind Schedule' :
             '✅ On Track'}
          </div>
        )}
      </div>
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          
          <XAxis 
            dataKey="date_formatted"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
          />
          
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            label={{ value: 'Story Points', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend />
          
          {/* Reference line at zero */}
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
          
          {/* Ideal burndown line */}
          <Line 
            type="monotone" 
            dataKey="ideal_remaining" 
            stroke="#9CA3AF" 
            strokeDasharray="8 4"
            strokeWidth={2}
            name="Ideal Burndown"
            dot={false}
            connectNulls={false}
          />
          
          {/* Actual burndown line */}
          <Line 
            type="monotone" 
            dataKey="remaining_points" 
            stroke="#3B82F6" 
            strokeWidth={3}
            name="Actual Remaining"
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            connectNulls={false}
          />
          
          {/* Forecast line */}
          <Line 
            type="monotone" 
            dataKey="forecast_remaining" 
            stroke="#10B981" 
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Forecast"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Sprint Health Summary */}
      {sprintHealth && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Time Progress</div>
              <div className="font-semibold text-gray-900 dark:text-white">{sprintHealth.timeProgress}%</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Work Progress</div>
              <div className="font-semibold text-gray-900 dark:text-white">{sprintHealth.workProgress}%</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Gap</div>
              <div className={`font-semibold ${
                sprintHealth.progressGap > 0 ? 'text-green-600' : 
                sprintHealth.progressGap < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
              }`}>
                {sprintHealth.progressGap > 0 ? '+' : ''}{sprintHealth.progressGap}%
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chart Description */}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <p>
          <strong>Ideal:</strong> Linear progression to completion • 
          <strong> Actual:</strong> Real remaining work • 
          <strong> Forecast:</strong> Velocity-based projection
        </p>
      </div>
    </div>
  );
};

export default BurndownChart;