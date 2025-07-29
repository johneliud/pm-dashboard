import React from 'react';

/**
 * Risk Summary Component
 * 
 * Displays high-level risk indicators and key recommendations.
 * Provides quick insights into project health and potential blockers.
 */
const RiskSummary = ({ data }) => {
  
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Summary</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p>No risk data available.</p>
        </div>
      </div>
    );
  }

  const { risk_level, risk_score, risk_factors, recommendations } = data;

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Summary</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getRiskIcon(risk_level)}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRiskColor(risk_level)}`}>
            {risk_level?.charAt(0).toUpperCase() + risk_level?.slice(1)} Risk
          </span>
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{risk_score}/100</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getRiskColor(risk_level)}`}
            style={{ width: `${risk_score}%` }}
          ></div>
        </div>
      </div>

      {/* Key Risk Factors */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">Key Risk Factors</h4>
        <div className="space-y-3">
          {/* Velocity Trend */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Velocity Trend</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {risk_factors?.velocity_declining ? 'Team velocity is declining' : 'Velocity is stable'}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              risk_factors?.velocity_trend === 'declining' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
              risk_factors?.velocity_trend === 'improving' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {risk_factors?.velocity_trend?.replace('_', ' ')}
            </span>
          </div>

          {/* Blocked Items */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Blocked Items</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {risk_factors?.long_blocked_items > 0 ? 
                  `${risk_factors.long_blocked_items} items blocked 3+ days` :
                  'No long-term blockers'
                }
              </div>
            </div>
            <span className={`font-bold text-lg ${
              risk_factors?.blocked_items > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {risk_factors?.blocked_items || 0}
            </span>
          </div>

          {/* Overdue Items */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Overdue Items</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {risk_factors?.severely_overdue > 0 ? 
                  `${risk_factors.severely_overdue} severely overdue` :
                  risk_factors?.overdue_items > 0 ? 'Recently overdue items' :
                  'All items on schedule'
                }
              </div>
            </div>
            <span className={`font-bold text-lg ${
              risk_factors?.overdue_items > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {risk_factors?.overdue_items || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">Priority Actions</h4>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border text-sm ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                        {rec.type}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 bg-opacity-50">
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{rec.message}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {recommendations.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  +{recommendations.length - 3} more recommendations available in detailed view
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Recommendations - Healthy Project */}
      {(!recommendations || recommendations.length === 0) && risk_level === 'low' && (
        <div className="text-center py-4">
          <span className="text-3xl mb-2 block">✅</span>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Project is healthy with no immediate risks detected.
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Keep up the great work!
          </div>
        </div>
      )}

      {/* Risk Calculation Note */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Risk score combines velocity trends, blocked items, overdue work, and team workload factors.
        </p>
      </div>
    </div>
  );
};

export default RiskSummary;