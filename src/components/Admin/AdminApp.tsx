import React from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminAppProps {
  isDarkMode?: boolean;
}

export function AdminApp({ isDarkMode = true }: AdminAppProps) {
  const { isAuthenticated, admin, loading, login, logout } = useAdminAuth();

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} isDarkMode={isDarkMode} />;
  }

  return <AdminDashboard isDarkMode={isDarkMode} onLogout={logout} admin={admin} />;
}