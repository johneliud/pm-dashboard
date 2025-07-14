import React from 'react';

const RiskAnalysis = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
        <div className="text-center text-gray-500 py-8">
          No risk data available.
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

  const getRiskTextColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Risk Score:</span>
          <span className={`font-bold text-lg ${getRiskTextColor(risk_level)}`}>
            {risk_score}/100
          </span>
        </div>
      </div>
      
      {/* Risk Level Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Risk Level</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRiskColor(risk_level)}`}>
            {risk_level.charAt(0).toUpperCase() + risk_level.slice(1)} Risk
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getRiskColor(risk_level)}`}
            style={{ width: `${risk_score}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Velocity Risk */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Velocity Trend</span>
              <span className={`text-xs px-2 py-1 rounded ${
                risk_factors.velocity_trend === 'declining' ? 'bg-red-100 text-red-700' :
                risk_factors.velocity_trend === 'improving' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {risk_factors.velocity_trend.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {risk_factors.velocity_declining ? 'Team velocity is declining' : 'Velocity is stable'}
            </div>
          </div>

          {/* Blockers */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Blocked Items</span>
              <span className={`font-bold ${
                risk_factors.blocked_items > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {risk_factors.blocked_items}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {risk_factors.long_blocked_items > 0 && (
                <span className="text-red-600">
                  {risk_factors.long_blocked_items} blocked for 3+ days
                </span>
              )}
              {risk_factors.long_blocked_items === 0 && risk_factors.blocked_items > 0 && (
                <span>Recently blocked items</span>
              )}
              {risk_factors.blocked_items === 0 && (
                <span className="text-green-600">No blocked items</span>
              )}
            </div>
          </div>

          {/* Overdue Items */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Overdue Items</span>
              <span className={`font-bold ${
                risk_factors.overdue_items > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {risk_factors.overdue_items}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {risk_factors.severely_overdue > 0 && (
                <span className="text-red-600">
                  {risk_factors.severely_overdue} severely overdue
                </span>
              )}
              {risk_factors.severely_overdue === 0 && risk_factors.overdue_items > 0 && (
                <span>Recently overdue</span>
              )}
              {risk_factors.overdue_items === 0 && (
                <span className="text-green-600">All items on schedule</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {rec.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm">{rec.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations */}
      {(!recommendations || recommendations.length === 0) && risk_level === 'low' && (
        <div className="text-center py-4">
          <span className="text-2xl">✅</span>
          <div className="text-sm text-gray-600 mt-2">
            Project is healthy with no immediate risks detected.
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;