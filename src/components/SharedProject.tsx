import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckSquare2, Eye, Calendar, Clock, Flame, Zap, FileText, Share2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TaskPreview } from './TaskPreview';
import { BoltBadge } from './BoltBadge';

interface SharedProjectProps {
  isDarkMode?: boolean;
}

interface SharedProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  content?: string;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
  };
}

export function SharedProject({ isDarkMode = true }: SharedProjectProps) {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedProject(token);
    }
  }, [token]);

  const loadSharedProject = async (shareToken: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading shared project with token:', shareToken);

      // First, verify the shared link exists and get project ID
      const { data: sharedLink, error: linkError } = await supabase
        .from('shared_links')
        .select('project_id, view_count')
        .eq('token', shareToken)
        .single();

      if (linkError) {
        console.error('❌ Shared link error:', linkError);
        setError('Shared project not found or link has expired.');
        return;
      }

      if (!sharedLink) {
        console.error('❌ No shared link found');
        setError('Shared project not found or link has expired.');
        return;
      }

      console.log('✅ Found shared link for project:', sharedLink.project_id);

      // Then get the project data with user info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          color,
          content,
          created_at,
          updated_at,
          user_id,
          profiles!projects_user_id_fkey (
            full_name
          )
        `)
        .eq('id', sharedLink.project_id)
        .single();

      if (projectError) {
        console.error('❌ Project error:', projectError);
        setError('Project not found or access denied.');
        return;
      }

      if (!projectData) {
        console.error('❌ No project data found');
        setError('Project not found or access denied.');
        return;
      }

      console.log('✅ Project data loaded:', projectData.name);

      // Increment view count
      try {
        await supabase
          .from('shared_links')
          .update({ view_count: (sharedLink.view_count || 0) + 1 })
          .eq('token', shareToken);
        console.log('✅ View count incremented');
      } catch (viewError) {
        console.warn('⚠️ Failed to increment view count:', viewError);
        // Don't fail the whole operation for this
      }

      setProject({
        ...projectData,
        user: projectData.profiles || { full_name: 'Unknown User' }
      });
    } catch (error) {
      console.error('❌ Error loading shared project:', error);
      setError('Failed to load shared project.');
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isDarkMode
    ? 'min-h-screen bg-gray-900 text-gray-100'
    : 'min-h-screen bg-gray-50 text-gray-900';

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg border border-gray-700'
    : 'bg-white rounded-lg border border-gray-200 shadow-sm';

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading shared project...</p>
          </div>
        </div>
        <BoltBadge isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center h-screen">
          <div className={`text-center p-8 ${cardClasses} max-w-md mx-4`}>
            <Share2 className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h1 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Project Not Found
            </h1>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error || 'The shared project you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CheckSquare2 className="w-4 h-4" />
              <span>Go to Todo.is</span>
            </a>
          </div>
        </div>
        <BoltBadge isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-4 h-12 rounded"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {project.name}
                </h1>
                {project.description && (
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.description}
                  </p>
                )}
                <div className={`flex items-center space-x-4 mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span>Shared by {project.user.full_name}</span>
                  <span>•</span>
                  <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                <Eye className="w-3 h-3" />
                <span>Read-only</span>
              </div>
              <a
                href="/"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <CheckSquare2 className="w-4 h-4" />
                <span>Create Your Own</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Content */}
          <div className={`${cardClasses} flex flex-col`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Project Content
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className={`p-4 text-sm font-mono whitespace-pre-wrap break-words h-full ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {project.content || 'No content available.'}
              </pre>
            </div>
          </div>

          {/* Task Preview */}
          <div className={`${cardClasses} flex flex-col`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Task Overview
              </h2>
            </div>
            <div className="flex-1 overflow-hidden" style={{ height: '600px' }}>
              <TaskPreview
                content={project.content || ''}
                isDarkMode={isDarkMode}
                // Read-only mode - no interactions
                onTaskToggle={undefined}
                onStartTimer={undefined}
                onContentChange={undefined}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-8 p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Powered by Todo.is - Your Productivity Command Center
              </span>
            </div>
            <a
              href="/"
              className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              Get Started Free →
            </a>
          </div>
        </div>
      </div>

      {/* Bolt.new Badge - Required for Hackathon */}
      <BoltBadge isDarkMode={isDarkMode} />
    </div>
  );
}