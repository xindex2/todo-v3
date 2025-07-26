import React, { useState } from 'react';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Heart, 
  BarChart3, 
  Timer as TimerIcon,
  Settings,
  CheckSquare2,
  Folder,
  Code2,
  Shield,
  LogOut,
  LogIn,
  User,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import type { View } from '../App';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  timerActive: boolean;
  onTimerToggle: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isAdmin?: boolean;
  user: any;
  onAuthRequired: (action?: 'signin' | 'signup') => void;
  onProjectShare?: () => void;
  activeProject?: any;
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  timerActive, 
  onTimerToggle,
  showLineNumbers,
  onToggleLineNumbers,
  isDarkMode,
  onThemeToggle,
  isAdmin = false,
  user,
  onAuthRequired,
  onProjectShare,
  activeProject
}: SidebarProps) {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'editor' as View, icon: FileText, label: 'Editor', shortcut: 'Ctrl+1' },
    { id: 'projects' as View, icon: Folder, label: 'Projects', shortcut: 'Ctrl+P' },
    { id: 'calendar' as View, icon: CalendarIcon, label: 'Schedule', shortcut: 'Ctrl+2' },
    { id: 'motivation' as View, icon: Heart, label: 'Motivation', shortcut: 'Ctrl+3' },
    { id: 'analytics' as View, icon: BarChart3, label: 'Analytics', shortcut: 'Ctrl+4' },
    { id: 'pricing' as View, icon: Crown, label: 'Pricing', shortcut: 'Ctrl+5' },
  ];

  // Add admin menu item if user is admin
  if (user && isAdmin) {
    menuItems.push({ id: 'admin' as View, icon: Shield, label: 'Admin', shortcut: 'Ctrl+A' });
  }

  const handleShare = async () => {
    if (!user) {
      onAuthRequired('signin');
      return;
    }

    if (!activeProject) {
      alert('Please select a project to share');
      return;
    }

    if (onProjectShare) {
      onProjectShare();
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const baseClasses = isDarkMode 
    ? 'bg-gray-800 border-r border-gray-700 flex flex-col'
    : 'bg-white border-r border-gray-300 flex flex-col';

  const logoClasses = isDarkMode
    ? 'h-12 flex items-center justify-center border-b border-gray-700'
    : 'h-12 flex items-center justify-center border-b border-gray-300';

  const mobileMenuClasses = isDarkMode
    ? 'fixed inset-0 bg-gray-800 z-50 flex flex-col md:hidden'
    : 'fixed inset-0 bg-white z-50 flex flex-col md:hidden';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`md:hidden fixed top-3 left-3 z-40 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex w-16 ${baseClasses}`}>
        {/* Logo */}
        <div className={logoClasses}>
          <CheckSquare2 className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            const buttonClasses = isDarkMode
              ? `w-full h-12 flex items-center justify-center group relative ${
                  isActive
                    ? item.id === 'admin' 
                      ? 'bg-red-600 text-white'
                      : item.id === 'pricing'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                } transition-all duration-200`
              : `w-full h-12 flex items-center justify-center group relative ${
                  isActive
                    ? item.id === 'admin'
                      ? 'bg-red-600 text-white'
                      : item.id === 'pricing'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } transition-all duration-200`;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={buttonClasses}
                title={`${item.label} (${item.shortcut})`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className={`absolute left-0 w-1 h-8 ${
                    item.id === 'admin' 
                      ? 'bg-red-400' 
                      : item.id === 'pricing'
                      ? 'bg-yellow-400'
                      : isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                  } rounded-r`} />
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Editor Controls */}
        {activeView === 'editor' && (
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-2`}>
            <button
              onClick={onToggleLineNumbers}
              className={`w-full h-12 flex items-center justify-center ${
                showLineNumbers
                  ? 'bg-green-600 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } transition-all duration-200`}
              title={`${showLineNumbers ? 'Hide' : 'Show'} Line Numbers`}
            >
              <Code2 className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Timer Toggle */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-2`}>
          <button
            onClick={onTimerToggle}
            className={`w-full h-12 flex items-center justify-center ${
              timerActive
                ? 'bg-green-600 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } transition-all duration-200`}
            title="Toggle Timer (Ctrl+Shift+T)"
          >
            <TimerIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Share Button - Only show when project is active and user is authenticated */}
        {user && activeProject && (
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-2`}>
            <button
              onClick={handleShare}
              className={`w-full h-12 flex items-center justify-center ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } transition-all duration-200`}
              title="Share Project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-2`}>
          <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle} />
        </div>
        
        {/* Auth Section */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-2`}>
          {user ? (
            <button
              onClick={handleSignOut}
              className={`w-full h-12 flex items-center justify-center ${
                isDarkMode
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
              } transition-all duration-200`}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => onAuthRequired('signin')}
              className={`w-full h-12 flex items-center justify-center ${
                isDarkMode
                  ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
              } transition-all duration-200`}
              title="Sign In"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={mobileMenuClasses}>
          {/* Header */}
          <div className={`h-16 flex items-center justify-between px-4 ${
            isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-300'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckSquare2 className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className="text-lg font-semibold">Todo.is</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              const buttonClasses = isDarkMode
                ? `w-full flex items-center space-x-3 px-6 py-4 ${
                    isActive
                      ? item.id === 'admin' 
                        ? 'bg-red-600 text-white'
                        : item.id === 'pricing'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  } transition-all duration-200`
                : `w-full flex items-center space-x-3 px-6 py-4 ${
                    isActive
                      ? item.id === 'admin'
                        ? 'bg-red-600 text-white'
                        : item.id === 'pricing'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  } transition-all duration-200`;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={buttonClasses}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls */}
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} py-4`}>
            {/* Timer Toggle */}
            <button
              onClick={() => {
                onTimerToggle();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 ${
                timerActive
                  ? 'bg-green-600 text-white'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              } transition-all duration-200`}
            >
              <TimerIcon className="w-5 h-5" />
              <span>Timer</span>
            </button>

            {/* Share Button - Mobile */}
            {user && activeProject && (
              <button
                onClick={() => {
                  handleShare();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                } transition-all duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share Project</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`w-full flex items-center space-x-3 px-6 py-3 ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              } transition-all duration-200`}
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${
                  isDarkMode
                    ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                    : 'text-red-600 hover:text-red-700 hover:bg-gray-100'
                } transition-all duration-200`}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onAuthRequired('signin');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${
                  isDarkMode
                    ? 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                    : 'text-green-600 hover:text-green-700 hover:bg-gray-100'
                } transition-all duration-200`}
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}