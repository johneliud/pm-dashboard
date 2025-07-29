import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamVelocityChart from '../../Charts/TeamVelocityChart';
import TeamWorkloadChart from '../../Charts/TeamWorkloadChart';
import CompletionRateCard from '../../Charts/CompletionRateCard';
import CycleTimeCard from '../../Charts/CycleTimeCard';

/**
 * Team Performance Metrics Component
 * 
 * Primary Value: Understand team velocity and productivity trends
 * 
 * Key Features:
 * 1. Velocity Chart - Story points or tasks completed per sprint (last 6 sprints)
 * 2. Team Workload Distribution - Visual breakdown of work assigned per team member
 * 3. Completion Rate - Percentage of committed work actually finished
 * 4. Cycle Time - Average time from "In Progress" to "Done" status
 */
const TeamPerformance = () => {
  const [velocityData, setVelocityData] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [enhancedWorkloadData, setEnhancedWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get project ID from URL or context (assuming it's available)
  const projectId = new URLSearchParams(window.location.search).get('projectId') || 
                   localStorage.getItem('selectedProjectId') || 
                   '1'; // fallback

  useEffect(() => {
    const fetchTeamPerformanceData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch all team performance data in parallel
        const [velocityResponse, workloadResponse, enhancedWorkloadResponse] = await Promise.all([
          axios.get(`/api/analytics/${projectId}/velocity`, config),
          axios.get(`/api/analytics/${projectId}/workload`, config),
          axios.get(`/api/analytics/${projectId}/enhanced-workload`, config)
        ]);

        setVelocityData(velocityResponse.data);
        setWorkloadData(workloadResponse.data);
        setEnhancedWorkloadData(enhancedWorkloadResponse.data);
        
      } catch (err) {
        console.error('Error fetching team performance data:', err);
        setError(err.response?.data?.error || 'Failed to load team performance data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTeamPerformanceData();
    }
  }, [projectId]);

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Understand team velocity and productivity trends
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance Metrics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Understand team velocity and productivity trends
        </p>
      </div>

      {/* Velocity Chart - Full Width */}
      <div className="w-full">
        <TeamVelocityChart data={velocityData} loading={loading} />
      </div>

      {/* Completion Rate and Cycle Time - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionRateCard data={workloadData} loading={loading} />
        <CycleTimeCard data={enhancedWorkloadData} loading={loading} />
      </div>

      {/* Team Workload Distribution - Full Width */}
      <div className="w-full">
        <TeamWorkloadChart data={workloadData} loading={loading} />
      </div>

      {/* Performance Summary */}
      {!loading && workloadData && workloadData.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            📊 Performance Insights
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Team has {workloadData.length} active members working on this project</p>
            <p>• Average velocity: {velocityData?.average_velocity || 0} story points per week</p>
            <p>• Total items in progress: {workloadData.reduce((sum, member) => sum + (member.in_progress_items || 0), 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;