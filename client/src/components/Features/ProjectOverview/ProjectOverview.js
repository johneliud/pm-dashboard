import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import LoadingSpinner from '../../common/LoadingSpinner';
import ProgressIndicators from './ProgressIndicators';
import BurndownChart from './BurndownChart';
import MilestoneProgress from './MilestoneProgress';
import RiskSummary from './RiskSummary';
import axios from 'axios';
import config from '../../../config';

/**
 * Project Progress Overview Component
 * 
 * Primary Value: Answer "Where are we vs where we should be?"
 * 
 * Key Features:
 * 1. Sprint Burndown Chart - Visual tracking of remaining work against ideal completion line
 * 2. Progress Percentage - Current completion vs planned completion based on timeline
 * 3. At-Risk Indicators - Red/yellow/green status based on velocity vs remaining time
 * 4. Milestone Progress - Percentage complete for each milestone with target dates
 */
const ProjectOverview = () => {
  const { projectId } = useParams();
  const { project } = useOutletContext();
  
  const [data, setData] = useState({
    overview: null,
    burndown: null,
    milestones: null,
    riskAnalysis: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    fetchOverviewData();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetches all data needed for project overview
   * Combines multiple API calls for comprehensive dashboard view
   */
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all required data in parallel for better performance
      const [overviewResponse, burndownResponse, milestonesResponse, riskResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/${projectId}/overview`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/burndown`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/milestones`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/risk-analysis`)
      ]);

      setData({
        overview: overviewResponse.data,
        burndown: burndownResponse.data,
        milestones: milestonesResponse.data,
        riskAnalysis: riskResponse.data
      });

    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError(error.response?.data?.error || 'Failed to fetch project overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading project overview..." />
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

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Progress Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track where you are vs where you should be across sprints and milestones
        </p>
      </div>

      {/* Key Metrics Row */}
      <ProgressIndicators 
        data={data.overview} 
        riskData={data.riskAnalysis}
        project={project}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <div className="xl:col-span-1">
          <BurndownChart data={data.burndown} />
        </div>

        {/* Risk Summary */}
        <div className="xl:col-span-1">
          <RiskSummary data={data.riskAnalysis} />
        </div>
      </div>

      {/* Milestone Progress */}
      <MilestoneProgress data={data.milestones} />

      {/* No Data Message */}
      {(!data.overview?.progress && !data.burndown?.burndown_data && !data.milestones?.length) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sync your project data to see progress metrics, burndown charts, and milestone tracking
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
