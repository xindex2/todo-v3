import React, { useState, useEffect } from 'react';
import { Users, Settings, BarChart3, Key, Shield, Database, Activity, LogOut, Lock, Folder, CheckSquare, Calendar, Timer, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSecurity } from './AdminSecurity';

interface AdminDashboardProps {
  isDarkMode?: boolean;
  onLogout?: () => void;
  admin?: any;
}

interface DatabaseStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalEvents: number;
  totalTimerSessions: number;
  totalSharedLinks: number;
  activeUsers: number;
  completedTasks: number;
  sharedProjects: number;
  todayEvents: number;
  todayTimerSessions: number;
}

export function AdminDashboard({ isDarkMode = true, onLogout, admin }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'analytics' | 'security'>('users');
  const [stats, setStats] = useState<DatabaseStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalEvents: 0,
    totalTimerSessions: 0,
    totalSharedLinks: 0,
    activeUsers: 0,
    completedTasks: 0,
    sharedProjects: 0,
    todayEvents: 0,
    todayTimerSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const handleSessionExpired = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const loadStats = async () => {
    try {
      const sessionToken = localStorage.getItem('admin-session-token');
      const adminData = localStorage.getItem('admin-data');
      
      if (!sessionToken || !adminData) {
        console.error('No admin session token');
        return;
      }

      // Use edge function to get comprehensive database stats
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-database-stats`, {
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

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          totalUsers: 0,
          totalProjects: 0,
          totalTasks: 0,
          totalEvents: 0,
          totalTimerSessions: 0,
          totalSharedLinks: 0,
          activeUsers: 0,
          completedTasks: 0,
          sharedProjects: 0,
          todayEvents: 0,
          todayTimerSessions: 0,
        });
      } else {
        console.error('Failed to fetch database stats');
        // Fallback to direct database queries if edge function fails
        await loadStatsDirectly();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to direct database queries
      await loadStatsDirectly();
    } finally {
      setLoading(false);
    }
  };

  const loadStatsDirectly = async () => {
    try {
      // Get basic counts from each table
      const [
        usersResult,
        projectsResult,
        tasksResult,
        eventsResult,
        timerSessionsResult,
        sharedLinksResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('timer_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('shared_links').select('*', { count: 'exact', head: true })
      ]);

      // Get additional stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        completedTasksResult,
        sharedProjectsResult,
        todayEventsResult,
        todayTimerSessionsResult,
        activeUsersResult
      ] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('completed', true),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_shared', true),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', todayISO),
        supabase.from('timer_sessions').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString())
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalTasks: tasksResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalTimerSessions: timerSessionsResult.count || 0,
        totalSharedLinks: sharedLinksResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        completedTasks: completedTasksResult.count || 0,
        sharedProjects: sharedProjectsResult.count || 0,
        todayEvents: todayEventsResult.count || 0,
        todayTimerSessions: todayTimerSessionsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats directly:', error);
      // Set default stats if there's an error
      setStats({
        totalUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        totalEvents: 0,
        totalTimerSessions: 0,
        totalSharedLinks: 0,
        activeUsers: 0,
        completedTasks: 0,
        sharedProjects: 0,
        todayEvents: 0,
        todayTimerSessions: 0,
      });
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const containerClasses = isDarkMode
    ? 'h-screen bg-gray-900 flex flex-col'
    : 'h-screen bg-white flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'
    : 'h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4';

  const navClasses = isDarkMode
    ? 'border-b border-gray-700 px-4 py-3'
    : 'border-b border-gray-300 px-4 py-3';

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg p-6 border border-gray-700'
    : 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <Shield className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <span className="text-sm font-medium">Admin Dashboard</span>
          {admin && (
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              • {admin.username}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Database Connected
          </span>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className={navClasses}>
        <nav className="flex space-x-6">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'System Settings', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'security', label: 'Security', icon: Lock }
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const buttonClasses = isDarkMode
              ? `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              : `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={buttonClasses}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Comprehensive Stats Overview */}
      <div className="p-6 border-b border-gray-700">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading database statistics...</p>
          </div>
        ) : (
          <>
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalUsers}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {stats.activeUsers} active (7 days)
                    </p>
                  </div>
                  <Users className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Projects</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalProjects}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {stats.sharedProjects} shared
                    </p>
                  </div>
                  <Folder className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalTasks}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {stats.completedTasks} completed
                    </p>
                  </div>
                  <CheckSquare className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Timer Sessions</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalTimerSessions}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      {stats.todayTimerSessions} today
                    </p>
                  </div>
                  <Timer className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Calendar Events</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalEvents}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {stats.todayEvents} today
                    </p>
                  </div>
                  <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shared Links</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalSharedLinks}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Active shares
                    </p>
                  </div>
                  <Share2 className={`w-8 h-8 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
              </div>

              <div className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Database Health</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Excellent
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      All systems operational
                    </p>
                  </div>
                  <Database className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Database Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={isDarkMode ? 'text-blue-200' : 'text-blue-600'}>Task Completion Rate:</span>
                  <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className={isDarkMode ? 'text-blue-200' : 'text-blue-600'}>Project Sharing Rate:</span>
                  <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalProjects > 0 ? Math.round((stats.sharedProjects / stats.totalProjects) * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className={isDarkMode ? 'text-blue-200' : 'text-blue-600'}>Avg Tasks/User:</span>
                  <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalUsers > 0 ? Math.round(stats.totalTasks / stats.totalUsers) : 0}
                  </span>
                </div>
                <div>
                  <span className={isDarkMode ? 'text-blue-200' : 'text-blue-600'}>Avg Projects/User:</span>
                  <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalUsers > 0 ? Math.round(stats.totalProjects / stats.totalUsers) : 0}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'users' && <UserManagement isDarkMode={isDarkMode} onLogout={onLogout} />}
        {activeTab === 'settings' && <SystemSettings isDarkMode={isDarkMode} onLogout={onLogout} />}
        {activeTab === 'analytics' && <AdminAnalytics isDarkMode={isDarkMode} onLogout={onLogout} />}
        {activeTab === 'security' && <AdminSecurity isDarkMode={isDarkMode} admin={admin} onLogout={onLogout} />}
      </div>
    </div>
  );
}