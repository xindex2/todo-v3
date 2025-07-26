import React, { useState } from 'react';
import { Lock, Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminSecurityProps {
  isDarkMode?: boolean;
  admin?: any;
  onLogout?: () => void;
}

export function AdminSecurity({ isDarkMode = true, admin, onLogout }: AdminSecurityProps) {
  const { changePassword } = useAdminAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSessionExpired = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update password' });
    }

    setLoading(false);
  };

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg p-6 border border-gray-700'
    : 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm';

  const inputClasses = isDarkMode
    ? 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="p-6 space-y-6">
      {/* Admin Account Info */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Account
          </h3>
        </div>

        {admin && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Username
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {admin.username}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Status
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                admin.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last Login
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Account Created
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(admin.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <Key className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Change Password
          </h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={inputClasses}
              required
              minLength={8}
            />
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Security Information */}
      <div className={cardClasses}>
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Security Information
          </h3>
        </div>

        <div className="space-y-3">
          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/30' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`font-medium mb-1 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Database Authentication
            </h4>
            <p className={`text-sm ${
              isDarkMode ? 'text-blue-200' : 'text-blue-600'
            }`}>
              Admin credentials are securely stored in the database with proper encryption.
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700/30' 
              : 'bg-green-50 border-green-200'
          }`}>
            <h4 className={`font-medium mb-1 ${
              isDarkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              Session Management
            </h4>
            <p className={`text-sm ${
              isDarkMode ? 'text-green-200' : 'text-green-600'
            }`}>
              Admin sessions are tracked and automatically expire after 24 hours.
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-purple-900/20 border-purple-700/30' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <h4 className={`font-medium mb-1 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>
              Access Logging
            </h4>
            <p className={`text-sm ${
              isDarkMode ? 'text-purple-200' : 'text-purple-600'
            }`}>
              All admin login attempts and actions are logged with IP addresses and timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}