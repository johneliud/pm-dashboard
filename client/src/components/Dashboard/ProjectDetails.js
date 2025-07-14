import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BurndownChart from '../Charts/BurndownChart';
import VelocityChart from '../Charts/VelocityChart';
import StatusDistribution from '../Charts/StatusDistribution';
import ProgressCard from '../Charts/ProgressCard';
import MilestoneTimeline from '../Charts/MilestoneTimeline';
import RiskAnalysis from '../Charts/RiskAnalysis';
import EnhancedWorkload from '../Charts/EnhancedWorkload';
import AnalyticsFilters from './AnalyticsFilters';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [phase3Analytics, setPhase3Analytics] = useState({
    milestones: null,
    riskAnalysis: null,
    enhancedWorkload: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProjectData();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project info and analytics data
      const [projectResponse, analyticsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/projects`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/overview`)
      ]);

      // Find the specific project
      const projectData = projectResponse.data.projects.find(p => p.id === parseInt(projectId));
      if (!projectData) {
        setError('Project not found');
        return;
      }

      setProject(projectData);
      setAnalytics(analyticsResponse.data);

      await fetchPhase3Analytics();

    } catch (error) {
      console.error('Error fetching project data:', error);
      setError(error.response?.data?.error || 'Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhase3Analytics = async () => {
    try {
      const [milestonesResponse, riskResponse, workloadResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/${projectId}/milestones`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/risk-analysis`),
        axios.get(`${API_BASE_URL}/analytics/${projectId}/enhanced-workload`)
      ]);

      setPhase3Analytics({
        milestones: milestonesResponse.data,
        riskAnalysis: riskResponse.data,
        enhancedWorkload: workloadResponse.data
      });

      // Extract team members and milestones for filters
      if (workloadResponse.data && workloadResponse.data.length > 0) {
        const members = workloadResponse.data.map((member, index) => ({
          id: index + 1,
          display_name: member.assignee,
          github_username: member.assignee
        }));
        setTeamMembers(members);
      }

      if (milestonesResponse.data && milestonesResponse.data.length > 0) {
        const milestoneNames = milestonesResponse.data.map(m => m.name);
        setMilestones(milestoneNames);
      }

    } catch (error) {
      console.error('Error fetching Phase 3 analytics:', error);
    }
  };

  const handleFiltersChange = useCallback(async (newFilters) => {
    setFilters(newFilters);
    
    // Only fetch filtered data if there are active filters
    const hasActiveFilters = Object.values(newFilters).some(value => value !== '');
    if (hasActiveFilters) {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await axios.get(`${API_BASE_URL}/analytics/${projectId}/filtered?${queryParams}`);
        console.log('Filtered analytics:', response.data);
      } catch (error) {
        console.error('Error fetching filtered analytics:', error);
      }
    }
  }, [projectId, API_BASE_URL]);

  const handleSyncProject = async () => {
    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/sync`);
      alert(`Sync completed! ${response.data.itemsSynced} items synced.`);
      
      // Refresh analytics data after sync
      fetchProjectData();
    } catch (error) {
      setError(error.response?.data?.error || 'Sync failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading project analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                <p className="text-sm text-gray-600">
                  {project?.github_owner}/{project?.github_repo} (Project #{project?.github_project_number})
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSyncProject}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Sync Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Analytics Filters */}
        <AnalyticsFilters 
          onFiltersChange={handleFiltersChange}
          teamMembers={teamMembers}
          milestones={milestones}
        />

        {/* Analytics Grid */}
        <div className="grid gap-6">
          {/* Progress Overview & Risk Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ProgressCard data={analytics?.progress} />
            <RiskAnalysis data={phase3Analytics.riskAnalysis} />
          </div>

          {/* Milestone Timeline */}
          <MilestoneTimeline data={phase3Analytics.milestones} />

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BurndownChart data={analytics?.burndown} />
            <VelocityChart data={analytics?.velocity} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <StatusDistribution data={analytics?.status_distribution} />
            <EnhancedWorkload data={phase3Analytics.enhancedWorkload} />
          </div>
        </div>

        {/* No Data Message */}
        {(!analytics?.progress && !analytics?.status_distribution && !analytics?.velocity) && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
            <p className="text-gray-600 mb-6">
              Sync your project data to see charts and analytics
            </p>
            <button
              onClick={handleSyncProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sync Project Data
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;