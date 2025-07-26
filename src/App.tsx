import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TaskPreview } from './components/TaskPreview';
import { Timer } from './components/Timer';
import { Calendar } from './components/Calendar';
import { Motivation } from './components/Motivation';
import { ProjectManager } from './components/ProjectManager';
import { Analytics } from './components/Analytics';
import { Pricing } from './components/Pricing';
import { StatusBar } from './components/StatusBar';
import { AuthModal } from './components/Auth/AuthModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ProjectShareModal } from './components/ProjectShareModal';
import { VisitorPopup } from './components/VisitorPopup';
import { BoltBadge } from './components/BoltBadge';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAuth } from './hooks/useAuth';
import { useSupabaseProjects } from './hooks/useSupabaseProjects';
import { useProjects } from './hooks/useProjects';

export type View = 'editor' | 'calendar' | 'motivation' | 'analytics' | 'projects' | 'pricing' | 'admin';

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  
  // Use Supabase projects if authenticated, local projects if guest
  const supabaseProjects = useSupabaseProjects();
  const localProjects = useProjects();
  
  const projects = user ? supabaseProjects : localProjects;

  const [activeView, setActiveView] = useState<View>('editor');
  const [timerActive, setTimerActive] = useState(false);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | undefined>();
  const [completedTasks, setCompletedTasks] = useState(0);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'signin' | 'signup'>('signin');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ projectName: string; shareUrl: string } | null>(null);
  const [showVisitorPopup, setShowVisitorPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [editorContent, setEditorContent] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'editor' | 'preview'>('editor');

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Show visitor popup for new visitors - always show the video
  useEffect(() => {
    if (!authLoading && !user) {
      // Always show popup for non-authenticated users
      setShowVisitorPopup(true);
    } else {
      // Hide popup for authenticated users
      setShowVisitorPopup(false);
    }
  }, [authLoading, user]);

  // Initialize editor content from active project
  useEffect(() => {
    if (projects.activeProject) {
      const projectContent = projects.activeProject.content || `# ${projects.activeProject.name}

Welcome to your project! Start adding tasks:

- Complete project setup
  -- Configure development environment
  -- Set up version control
- Plan project milestones @2024-01-20
- Review requirements 🔥 High priority

## Notes
Add any additional notes or ideas here...`;
      setEditorContent(projectContent);
    }
  }, [projects.activeProjectId, projects.activeProject]);

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem('theme-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Keyboard shortcuts
  useHotkeys('ctrl+1', () => setActiveView('editor'));
  useHotkeys('ctrl+2', () => setActiveView('calendar'));
  useHotkeys('ctrl+3', () => setActiveView('motivation'));
  useHotkeys('ctrl+4', () => setActiveView('analytics'));
  useHotkeys('ctrl+p', () => setActiveView('projects'));
  useHotkeys('ctrl+5', () => setActiveView('pricing'));
  useHotkeys('ctrl+shift+t', () => setTimerActive(!timerActive));

  // Update project content when editor changes (debounced)
  useEffect(() => {
    if (projects.activeProject && editorContent !== projects.activeProject.content) {
      const timeoutId = setTimeout(() => {
        projects.updateProjectContent(projects.activeProjectId, editorContent);
      }, 1000); // Save after 1 second of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [editorContent, projects.activeProjectId, projects.activeProject, projects.updateProjectContent]);

  // Calculate completed tasks from content
  useEffect(() => {
    const completed = editorContent.split('\n').filter(line => 
      line.trim().includes('[x]')
    ).length;
    setCompletedTasks(completed);
  }, [editorContent]);

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    console.log(`Task ${taskId} ${completed ? 'completed' : 'uncompleted'}`);
  };

  const handleStartTimer = (taskId: string) => {
    setActiveTimerTaskId(taskId);
    setTimerActive(true);
  };

  const handleContentChange = (newContent: string) => {
    setEditorContent(newContent);
  };

  const handleProjectSelect = (projectId: string) => {
    projects.setActiveProjectId(projectId);
    setActiveView('editor'); // Switch to editor when selecting a project
  };

  const handleProjectShare = async () => {
    if (!user) {
      setAuthAction('signin');
      setShowAuthModal(true);
      return;
    }

    if (!projects.activeProject) {
      alert('Please select a project to share');
      return;
    }

    if ('shareProject' in projects) {
      try {
        console.log('🔗 Attempting to share project:', projects.activeProjectId);
        const token = await projects.shareProject(projects.activeProjectId);
        
        if (token) {
          const shareUrl = `${window.location.origin}/shared/${token}`;
          const project = projects.projects.find(p => p.id === projects.activeProjectId);
          
          console.log('✅ Share URL generated:', shareUrl);
          
          // Show the share modal with the URL
          setShareData({
            projectName: project?.name || 'Shared Project',
            shareUrl
          });
          setShowShareModal(true);
        } else {
          console.error('❌ Failed to generate share token');
          alert('❌ Failed to create share link. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error sharing project:', error);
        alert('❌ Failed to share project. Please try again.');
      }
    }
  };

  const handleAuthRequired = (action: 'signin' | 'signup' = 'signin') => {
    setAuthAction(action);
    setShowAuthModal(true);
  };

  // Show minimal loading only for a very short time
  if (authLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if user is admin and admin view is active
  if (user && profile?.is_admin && activeView === 'admin') {
    return <AdminDashboard isDarkMode={isDarkMode} />;
  }

  // Theme-based classes
  const appClasses = isDarkMode 
    ? 'h-screen bg-gray-900 text-gray-100 flex flex-col font-inter'
    : 'h-screen bg-gray-50 text-gray-900 flex flex-col font-inter';

  const mainClasses = isDarkMode
    ? 'flex flex-1 overflow-hidden'
    : 'flex flex-1 overflow-hidden';

  const resizeHandleClasses = isDarkMode
    ? 'w-1 bg-gray-700 hover:bg-gray-600 transition-colors'
    : 'w-1 bg-gray-300 hover:bg-gray-400 transition-colors';

  const timerClasses = isDarkMode
    ? 'w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-700'
    : 'w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-300';

  const mobileToggleClasses = isDarkMode
    ? 'flex md:hidden bg-gray-800 border-b border-gray-700 p-2'
    : 'flex md:hidden bg-gray-100 border-b border-gray-300 p-2';

  return (
    <div className={appClasses}>
      <div className={mainClasses}>
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          timerActive={timerActive}
          onTimerToggle={() => setTimerActive(!timerActive)}
          showLineNumbers={showLineNumbers}
          onToggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          isAdmin={profile?.is_admin || false}
          user={user}
          onAuthRequired={handleAuthRequired}
          onProjectShare={handleProjectShare}
          activeProject={projects.activeProject}
        />
        
        <main className="flex-1 flex flex-col">
          {activeView === 'editor' && (
            <div className="flex-1 flex flex-col">
              {/* Mobile Panel Switcher */}
              {isMobileView && (
                <div className={mobileToggleClasses}>
                  <div className="flex w-full rounded-lg bg-gray-700 p-1">
                    <button
                      onClick={() => setMobileActivePanel('editor')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        mobileActivePanel === 'editor'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setMobileActivePanel('preview')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        mobileActivePanel === 'preview'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile: Single panel view */}
              {isMobileView ? (
                <div className="flex-1 overflow-hidden">
                  {mobileActivePanel === 'editor' ? (
                    <Editor 
                      content={editorContent}
                      onChange={handleContentChange}
                      showLineNumbers={showLineNumbers}
                      isDarkMode={isDarkMode}
                      onAuthRequired={handleAuthRequired}
                    />
                  ) : (
                    <TaskPreview 
                      content={editorContent}
                      onTaskToggle={handleTaskToggle}
                      onStartTimer={handleStartTimer}
                      onContentChange={handleContentChange}
                      isDarkMode={isDarkMode}
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                </div>
              ) : (
                /* Desktop: Resizable panels */
                <div className="flex-1 overflow-hidden">
                  <PanelGroup direction="horizontal">
                    <Panel defaultSize={50} minSize={30}>
                      <Editor 
                        content={editorContent}
                        onChange={handleContentChange}
                        showLineNumbers={showLineNumbers}
                        isDarkMode={isDarkMode}
                        onAuthRequired={handleAuthRequired}
                      />
                    </Panel>
                    <PanelResizeHandle className={resizeHandleClasses} />
                    <Panel defaultSize={50} minSize={30}>
                      <TaskPreview 
                        content={editorContent}
                        onTaskToggle={handleTaskToggle}
                        onStartTimer={handleStartTimer}
                        onContentChange={handleContentChange}
                        isDarkMode={isDarkMode}
                        onAuthRequired={handleAuthRequired}
                      />
                    </Panel>
                  </PanelGroup>
                </div>
              )}
            </div>
          )}
          
          {activeView === 'projects' && (
            <div className="flex-1 overflow-hidden">
              <ProjectManager
                projects={projects.projects}
                activeProjectId={projects.activeProjectId}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={projects.createProject}
                onProjectUpdate={projects.updateProject}
                onProjectDelete={projects.deleteProject}
                onProjectShare={handleProjectShare}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          
          {activeView === 'calendar' && (
            <div className="flex-1 overflow-hidden">
              <Calendar 
                content={editorContent} 
                onContentChange={handleContentChange}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          
          {activeView === 'motivation' && (
            <div className="flex-1 overflow-hidden">
              <Motivation 
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="flex-1 overflow-hidden">
              <Analytics 
                content={editorContent}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {activeView === 'pricing' && (
            <div className="flex-1 overflow-hidden">
              <Pricing 
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </main>
        
        {timerActive && (
          <div className={timerClasses}>
            <Timer 
              activeTaskId={activeTimerTaskId}
              onClose={() => setTimerActive(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>
      
      <StatusBar 
        completedTasks={completedTasks}
        totalLines={editorContent.split('\n').length}
        currentView={activeView}
        currentProject={projects.activeProject?.name}
        isDarkMode={isDarkMode}
        user={user}
        onAuthRequired={handleAuthRequired}
      />

      {/* Bolt.new Badge - Required for Hackathon */}
      <BoltBadge isDarkMode={isDarkMode} />

      {/* Visitor Popup */}
      {showVisitorPopup && (
        <VisitorPopup
          onClose={() => setShowVisitorPopup(false)}
          onAuthRequired={handleAuthRequired}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authAction}
          isDarkMode={isDarkMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Project Share Modal */}
      {showShareModal && shareData && (
        <ProjectShareModal
          projectName={shareData.projectName}
          shareUrl={shareData.shareUrl}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

export default App;