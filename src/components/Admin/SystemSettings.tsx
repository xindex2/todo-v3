import React, { useState, useEffect } from 'react';
import { Key, Save, Database, Settings } from 'lucide-react';

interface SystemSettingsProps {
  isDarkMode?: boolean;
  onLogout?: () => void;
}

interface AppSettings {
  id: string;
  openrouter_api_key?: string;
  app_name?: string;
  maintenance_mode?: boolean;
  max_users?: number;
  created_at: string;
  updated_at: string;
}

export function SystemSettings({ isDarkMode = true, onLogout }: SystemSettingsProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSessionExpired = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const loadSettings = async () => {
    try {
      const sessionToken = localStorage.getItem('admin-session-token');
      const adminData = localStorage.getItem('admin-data');
      
      if (!sessionToken || !adminData) {
        setMessage({ type: 'error', text: 'Admin session required' });
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-app-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': sessionToken,
          'X-Admin-Data': adminData,
        },
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setApiKey(data.settings?.openrouter_api_key || '');
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const sessionToken = localStorage.getItem('admin-session-token');
      const adminData = localStorage.getItem('admin-data');
      
      if (!sessionToken || !adminData) {
        setMessage({ type: 'error', text: 'Admin session required' });
        setSaving(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-app-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': sessionToken,
          'X-Admin-Data': adminData,
        },
        body: JSON.stringify({
          openrouter_api_key: apiKey || null,
        })
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setMessage({ type: 'success', text: data.message || 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg p-6 border border-gray-700'
    : 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm';

  const inputClasses = isDarkMode
    ? 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* API Configuration */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <Key className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            API Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              className={inputClasses}
            />
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This API key will be used for AI task generation across the platform.
              Get your key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                OpenRouter.ai
              </a>
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Database Information */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <Database className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Database Information
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Database Status
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Service Role
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last Updated
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <Settings className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            System Information
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Application Version
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1.0.0
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Environment
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Production
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Deployment Date
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}