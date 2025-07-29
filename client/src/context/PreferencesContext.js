import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

const DEFAULT_PREFERENCES = {
  theme: 'light', // 'light' | 'dark' | 'system'
  defaultView: 'dashboard', // 'dashboard' | 'analytics'
  autoRefresh: true,
  compactMode: false
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('pm-dashboard-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  // Handle theme changes and system theme detection
  useEffect(() => {
    const updateTheme = () => {
      if (preferences.theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(systemDark);
      } else {
        setIsDarkMode(preferences.theme === 'dark');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [preferences.theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const updatePreference = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('pm-dashboard-preferences', JSON.stringify(newPreferences));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('pm-dashboard-preferences');
  };

  const value = {
    preferences,
    isDarkMode,
    updatePreference,
    resetPreferences
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesContext;