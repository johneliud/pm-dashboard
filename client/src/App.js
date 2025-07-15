import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectLayout from './components/Dashboard/ProjectLayout';
import ProjectOverview from './components/Features/ProjectOverview/ProjectOverview';
import TeamPerformance from './components/Features/TeamPerformance/TeamPerformance';
import WorkItemAnalytics from './components/Features/WorkItemAnalytics/WorkItemAnalytics';
import SprintTracking from './components/Features/SprintTracking/SprintTracking';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

function AuthWrapper() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <LoginForm onToggleMode={() => setIsLogin(false)} />
    ) : (
      <RegisterForm onToggleMode={() => setIsLogin(true)} />
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/project/:projectId" element={<ProjectLayout />}>
        <Route path="overview" element={<ProjectOverview />} />
        <Route path="team" element={<TeamPerformance />} />
        <Route path="work-items" element={<WorkItemAnalytics />} />
        <Route path="sprints" element={<SprintTracking />} />
        <Route path="" element={<Navigate to="overview" replace />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <AuthProvider>
          <Router>
            <AuthWrapper />
          </Router>
        </AuthProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
