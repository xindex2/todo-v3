import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Loader2, X, FileText, Calendar, Target, AlertCircle, LogIn, UserPlus, Settings, RefreshCw } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../hooks/useAuth';

interface AITaskGeneratorProps {
  onTasksGenerated: (tasks: string[]) => void;
  onClose: () => void;
  onAuthRequired?: (action?: 'signin' | 'signup') => void;
}

const promptTemplates = [
  {
    id: 'project',
    title: 'Project Planning',
    icon: Target,
    prompt: 'Plan and organize a new project from start to finish'
  },
  {
    id: 'daily',
    title: 'Daily Routine',
    icon: Calendar,
    prompt: 'Create a productive daily routine with morning, work, and evening activities'
  },
  {
    id: 'learning',
    title: 'Learning Goal',
    icon: FileText,
    prompt: 'Learn a new skill or technology with structured milestones'
  },
  {
    id: 'health',
    title: 'Health & Fitness',
    icon: Target,
    prompt: 'Develop a comprehensive health and fitness improvement plan'
  },
  {
    id: 'business',
    title: 'Business Launch',
    icon: Target,
    prompt: 'Launch a new business or side project with all necessary steps'
  },
  {
    id: 'home',
    title: 'Home Organization',
    icon: FileText,
    prompt: 'Organize and declutter home spaces room by room'
  }
];

export function AITaskGenerator({ onTasksGenerated, onClose, onAuthRequired }: AITaskGeneratorProps) {
  const { user, profile } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { generateTasks, isLoading } = useAI();

  const handleGenerate = async () => {
    // Double-check user authentication
    if (!user) {
      console.log('❌ Generate blocked: User not authenticated');
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }

    const finalPrompt = selectedTemplate 
      ? promptTemplates.find(t => t.id === selectedTemplate)?.prompt || prompt
      : prompt;
      
    if (!finalPrompt.trim()) return;
    
    setError(null);
    console.log('🚀 Generating tasks for authenticated user:', user.email);
    const result = await generateTasks(finalPrompt);
    if (result.error) {
      setError(result.error);
    } else {
      onTasksGenerated(result.tasks);
      setPrompt('');
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    // Double-check user authentication
    if (!user) {
      console.log('❌ Template selection blocked: User not authenticated');
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }

    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setPrompt(template.prompt);
    }
  };

  const handleAuthAction = (action: 'signin' | 'signup') => {
    if (onAuthRequired) {
      onAuthRequired(action);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">AI Task Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Required Prompt - Only show if user is NOT authenticated */}
        {!user && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Sign In Required</h4>
              <p className="text-gray-300 text-sm">
                AI task generation requires an account to ensure quality and prevent abuse. 
                Sign in or create a free account to continue.
              </p>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Why sign in?</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Access to AI-powered task generation</li>
                <li>• Save and sync your projects across devices</li>
                <li>• Share projects with others</li>
                <li>• Track your productivity analytics</li>
                <li>• Free forever - no credit card required</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleAuthAction('signin')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => handleAuthAction('signup')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Main AI Generator Interface - Show directly for authenticated users */}
        {user && (
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Templates</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {promptTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-purple-600/20'
                          : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${
                        selectedTemplate === template.id ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                      <div className={`text-sm font-medium ${
                        selectedTemplate === template.id ? 'text-white' : 'text-gray-300'
                      }`}>
                        {template.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Describe what you want to accomplish
              </label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setSelectedTemplate(null);
                }}
                placeholder="e.g., Plan a productive morning routine, Organize my home office, Prepare for a job interview, Launch a new business..."
                className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400">
                Be specific about your goals. The AI will create structured tasks with sub-tasks, priorities, and descriptions.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Generation Options */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">What you'll get:</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Structured task hierarchy with main tasks and sub-tasks</li>
                <li>• Priority levels (🔥 High, ⚡ Medium, 📝 Low)</li>
                <li>• Suggested deadlines and schedules</li>
                <li>• Detailed descriptions for complex tasks</li>
                <li>• Organized sections with clear headings</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Tasks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Structured Tasks</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/30 text-blue-300 rounded-lg p-3">
              <p className="text-sm">
                <strong>Note:</strong> AI task generation powered by advanced language models to help you stay organized and productive.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}