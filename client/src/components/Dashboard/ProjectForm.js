import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

const ProjectForm = ({ onProjectCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    githubOwner: '',
    githubRepo: '',
    githubProjectNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = config.API_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/projects`, {
        name: formData.name.trim(),
        githubOwner: formData.githubOwner.trim(),
        githubRepo: formData.githubRepo.trim(),
        githubProjectNumber: parseInt(formData.githubProjectNumber)
      });

      onProjectCreated(response.data.project);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create project');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name.trim()}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Project"
            />
          </div>

          <div>
            <label htmlFor="githubOwner" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Owner
            </label>
            <input
              type="text"
              id="githubOwner"
              name="githubOwner"
              value={formData.githubOwner.trim()}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="username or organization"
            />
          </div>

          <div>
            <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository
            </label>
            <input
              type="text"
              id="githubRepo"
              name="githubRepo"
              value={formData.githubRepo.trim()}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="repository-name"
            />
          </div>

          <div>
            <label htmlFor="githubProjectNumber" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Project Number
            </label>
            <input
              type="number"
              id="githubProjectNumber"
              name="githubProjectNumber"
              value={formData.githubProjectNumber}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your GitHub project URL: /projects/[number]
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
