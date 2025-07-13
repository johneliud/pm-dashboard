import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BurndownChart from '../Charts/BurndownChart';
import VelocityChart from '../Charts/VelocityChart';
import StatusDistribution from '../Charts/StatusDistribution';
import ProgressCard from '../Charts/ProgressCard';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    } catch (error) {
      console.error('Error fetching project data:', error);
      setError(error.response?.data?.error || 'Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Analytics Grid */}
        <div className="grid gap-6">
          {/* Progress Overview */}
          <ProgressCard data={analytics?.progress} />

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BurndownChart data={analytics?.burndown} />
            <VelocityChart data={analytics?.velocity} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <StatusDistribution data={analytics?.status_distribution} />
            
            {/* Team Workload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
              {analytics?.team_workload && analytics.team_workload.length > 0 ? (
                <div className="space-y-3">
                  {analytics.team_workload.map((member, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{member.assignee}</div>
                        <div className="text-sm text-gray-600">
                          {member.completed_items}/{member.total_items} completed
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{member.total_points}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No team workload data available. Assign work items to team members to see distribution.
                </div>
              )}
            </div>
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