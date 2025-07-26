import React, { useState } from 'react';
import { Clock, CheckCircle2, FileText, Zap, Folder, User, UserPlus, Database, Wifi, Shield, Mail } from 'lucide-react';
import { PrivacyPolicy } from './Legal/PrivacyPolicy';
import { TermsOfService } from './Legal/TermsOfService';
import { ContactUs } from './Legal/ContactUs';
import type { View } from '../App';

interface StatusBarProps {
  completedTasks: number;
  totalLines: number;
  currentView: View;
  currentProject?: string;
  isDarkMode?: boolean;
  user?: any;
  onAuthRequired: (action?: 'signin' | 'signup') => void;
}

export function StatusBar({ 
  completedTasks, 
  totalLines, 
  currentView, 
  currentProject,
  isDarkMode = true,
  user,
  onAuthRequired
}: StatusBarProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const getViewLabel = (view: View) => {
    switch (view) {
      case 'editor': return 'Editor';
      case 'projects': return 'Projects';
      case 'calendar': return 'Calendar';
      case 'motivation': return 'Motivation';
      case 'analytics': return 'Analytics';
      case 'admin': return 'Admin';
      default: return 'Unknown';
    }
  };

  const statusBarClasses = isDarkMode
    ? 'h-6 bg-blue-600 border-t border-blue-500 flex items-center justify-between px-4 text-xs text-white'
    : 'h-6 bg-blue-600 border-t border-blue-500 flex items-center justify-between px-4 text-xs text-white';

  return (
    <>
      <div className={statusBarClasses}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{getViewLabel(currentView)}</span>
          </div>
          
          {currentProject && (
            <div className="flex items-center space-x-1">
              <Folder className="w-3 h-3" />
              <span>{currentProject}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <span>Lines: {totalLines}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed: {completedTasks}</span>
          </div>

          {/* Database Connection Status */}
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3" />
            <span>DB Connected</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Legal Links */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setShowPrivacy(true)}
              className="hover:text-blue-200 transition-colors"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              onClick={() => setShowTerms(true)}
              className="hover:text-blue-200 transition-colors"
            >
              Terms
            </button>
            <span>•</span>
            <button
              onClick={() => setShowContact(true)}
              className="hover:text-blue-200 transition-colors flex items-center space-x-1"
            >
              <Mail className="w-3 h-3" />
              <span>Contact</span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{user.email}</span>
              </div>
              {user.email_confirmed_at && (
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3 text-green-300" />
                  <span className="text-green-300">Synced</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-yellow-200">Guest Mode</span>
              <button
                onClick={() => onAuthRequired('signin')}
                className="flex items-center space-x-1 hover:text-yellow-200 transition-colors"
                title="Sign in to save your data"
              >
                <User className="w-3 h-3" />
                <span>Sign In</span>
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onAuthRequired('signup')}
                className="flex items-center space-x-1 hover:text-green-200 transition-colors"
                title="Create an account"
              >
                <UserPlus className="w-3 h-3" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {showPrivacy && (
        <PrivacyPolicy 
          onClose={() => setShowPrivacy(false)} 
          isDarkMode={isDarkMode} 
        />
      )}
      
      {showTerms && (
        <TermsOfService 
          onClose={() => setShowTerms(false)} 
          isDarkMode={isDarkMode} 
        />
      )}
      
      {showContact && (
        <ContactUs 
          onClose={() => setShowContact(false)} 
          isDarkMode={isDarkMode} 
        />
      )}
    </>
  );
}