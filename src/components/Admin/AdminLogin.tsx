import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isDarkMode?: boolean;
}

export function AdminLogin({ onLogin, isDarkMode = true }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onLogin(credentials.username, credentials.password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const containerClasses = isDarkMode
    ? 'min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4';

  const cardClasses = isDarkMode
    ? 'w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8'
    : 'w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-8';

  const inputClasses = isDarkMode
    ? 'w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
    : 'w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all';

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Access
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Secure administrative portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Admin Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className={inputClasses}
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Admin Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className={inputClasses}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !credentials.username || !credentials.password}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:scale-100"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        {/* Security Notice */}
        <div className={`mt-6 p-3 rounded-lg border ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-300' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <p className="text-xs text-center">
            🔒 Secure database authentication • All access attempts are logged
          </p>
        </div>

        {/* Back to App */}
        <div className="mt-4 text-center">
          <a
            href="/"
            className={`text-sm ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            ← Back to Todo.is
          </a>
        </div>
      </div>
    </div>
  );
}