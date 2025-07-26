import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminCredentials {
  id: string;
  username: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  admin: AdminCredentials | null;
  loading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    admin: null,
    loading: true
  });

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const sessionToken = localStorage.getItem('admin-session-token');
      const adminData = localStorage.getItem('admin-data');
      
      if (!sessionToken || !adminData) {
        setAuthState({ isAuthenticated: false, admin: null, loading: false });
        return;
      }

      // Check if session is still valid (24 hours)
      const sessionTime = localStorage.getItem('admin-session-time');
      if (sessionTime) {
        const sessionDate = new Date(sessionTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          // Session expired
          localStorage.removeItem('admin-session-token');
          localStorage.removeItem('admin-data');
          localStorage.removeItem('admin-session-time');
          setAuthState({ isAuthenticated: false, admin: null, loading: false });
          return;
        }
      }

      const admin = JSON.parse(adminData);
      setAuthState({
        isAuthenticated: true,
        admin,
        loading: false
      });
    } catch (error) {
      console.error('Error checking admin session:', error);
      setAuthState({ isAuthenticated: false, admin: null, loading: false });
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting admin login with:', { username, password: '***' });
      
      // Use the database function to verify admin login
      const { data, error } = await supabase.rpc('verify_admin_login', {
        username_input: username,
        password_input: password
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Login failed' };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const adminData = data[0];
      const sessionToken = crypto.randomUUID();
      const sessionTime = new Date().toISOString();

      // Store session data
      localStorage.setItem('admin-session-token', sessionToken);
      localStorage.setItem('admin-session-time', sessionTime);
      localStorage.setItem('admin-data', JSON.stringify({
        id: adminData.admin_id,
        username: adminData.username,
        is_active: adminData.is_active,
        last_login: adminData.last_login,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Update auth state
      setAuthState({
        isAuthenticated: true,
        admin: {
          id: adminData.admin_id,
          username: adminData.username,
          is_active: adminData.is_active,
          last_login: adminData.last_login,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        loading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('admin-session-token');
      localStorage.removeItem('admin-data');
      localStorage.removeItem('admin-session-time');
      setAuthState({ isAuthenticated: false, admin: null, loading: false });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if there's an error
      localStorage.removeItem('admin-session-token');
      localStorage.removeItem('admin-data');
      localStorage.removeItem('admin-session-time');
      setAuthState({ isAuthenticated: false, admin: null, loading: false });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.admin) {
        return { success: false, error: 'Not authenticated' };
      }

      // Verify current password first
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_admin_login', {
        username_input: authState.admin.username,
        password_input: currentPassword
      });

      if (verifyError || !verifyData || verifyData.length === 0) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password in database (simple text for development)
      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({ 
          password_hash: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.admin.id);

      if (updateError) {
        console.error('Password update error:', updateError);
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  return {
    ...authState,
    login,
    logout,
    changePassword,
    refreshSession: checkAdminSession
  };
}