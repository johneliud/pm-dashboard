import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StatusDistribution from '../../Charts/StatusDistribution';
import PriorityBreakdown from '../../Charts/PriorityBreakdown';
import SizeAnalysis from '../../Charts/SizeAnalysis';
import BlockersDashboard from '../../Charts/BlockersDashboard';
import LoadingSpinner from '../../common/LoadingSpinner';
import axios from 'axios';
import config from '../../../config';

/**
 * Work Item Analytics Component
 * 
 * Primary Value: Track task distribution and bottlenecks
 * 
 * Key Features:
 * 1. Status Distribution - Pie chart showing work across different status columns
 * 2. Priority Breakdown - High/Medium/Low priority work distribution
 * 3. Size Analysis - Distribution of work by estimate/size
 * 4. Blockers Dashboard - Items stuck in status for too long
 */
const WorkItemAnalytics = () => {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    fetchWorkItemAnalytics();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWorkItemAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_BASE_URL}/analytics/${projectId}/work-item-analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching work item analytics:', error);
      setError(error.response?.data?.error || 'Failed to fetch work item analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading work item analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const hasData = analytics && (
    analytics.status_distribution?.length > 0 ||
    analytics.priority_breakdown?.length > 0 ||
    analytics.size_analysis?.length > 0 ||
    analytics.blockers?.length > 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Item Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track task distribution and identify bottlenecks
        </p>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sync your project data to see comprehensive work item analytics including status distribution, priority breakdown, and blocker identification.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Top Row - Distribution Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StatusDistribution data={analytics.status_distribution} />
            <PriorityBreakdown data={analytics.priority_breakdown} />
          </div>

          {/* Middle Row - Size Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SizeAnalysis data={analytics.size_analysis} />
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Work Item Insights
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Total Items: {analytics.status_distribution?.reduce((sum, item) => sum + item.value, 0) || 0}</p>
                  <p>Priority Items: {analytics.priority_breakdown?.filter(item => item.name !== 'None').reduce((sum, item) => sum + item.value, 0) || 0}</p>
                  <p>Sized Items: {analytics.size_analysis?.filter(item => item.name !== 'None').reduce((sum, item) => sum + item.value, 0) || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Blockers Dashboard */}
          <div className="grid grid-cols-1 gap-6">
            <BlockersDashboard data={analytics.blockers} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkItemAnalytics;