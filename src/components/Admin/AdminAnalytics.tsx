import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Activity, TrendingUp } from 'lucide-react';

interface AdminAnalyticsProps {
  isDarkMode?: boolean;
  onLogout?: () => void;
}

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number }>;
  projectStats: Array<{ date: string; projects: number }>;
  sessionStats: Array<{ date: string; sessions: number }>;
  topUsers: Array<{ name: string; email: string; projects: number; sessions: number }>;
}

export function AdminAnalytics({ isDarkMode = true, onLogout }: AdminAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    projectStats: [],
    sessionStats: [],
    topUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleSessionExpired = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const loadAnalytics = async () => {
    try {
      const sessionToken = localStorage.getItem('admin-session-token');
      
      if (!sessionToken) {
        console.error('No admin session token');
        return;
      }

      // Use edge function to get analytics data
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Admin-Token': sessionToken,
        },
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || {
          userGrowth: [],
          projectStats: [],
          sessionStats: [],
          topUsers: [],
        });
      } else {
        console.error('Failed to fetch analytics data');
        // Set default empty analytics
        setAnalytics({
          userGrowth: [],
          projectStats: [],
          sessionStats: [],
          topUsers: [],
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default empty analytics
      setAnalytics({
        userGrowth: [],
        projectStats: [],
        sessionStats: [],
        topUsers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg p-6 border border-gray-700'
    : 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className={cardClasses}>
          <div className="flex items-center space-x-2 mb-4">
            <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              User Growth (Last 7 Days)
            </h3>
          </div>
          <div className="flex items-end space-x-2 h-32">
            {analytics.userGrowth.length > 0 ? analytics.userGrowth.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max(day.users * 20, 4)}px`,
                    maxHeight: '80px'
                  }}
                />
                <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            )) : (
              <div className="w-full text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project Creation */}
        <div className={cardClasses}>
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Projects Created (Last 7 Days)
            </h3>
          </div>
          <div className="flex items-end space-x-2 h-32">
            {analytics.projectStats.length > 0 ? analytics.projectStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ 
                    height: `${Math.max(day.projects * 15, 4)}px`,
                    maxHeight: '80px'
                  }}
                />
                <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            )) : (
              <div className="w-full text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Most Active Users
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  User
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Projects
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sessions
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.topUsers.length > 0 ? analytics.topUsers.map((user, index) => (
                <tr
                  key={index}
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.projects}
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.sessions}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No user activity data available
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}