import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Flame, Zap, FileText, Play, Pause, Plus, Share2, Eye, EyeOff, LogIn, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

interface TaskPreviewProps {
  content: string;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
  onStartTimer?: (taskId: string) => void;
  onContentChange?: (newContent: string) => void;
  isDarkMode?: boolean;
  onAuthRequired?: (action?: 'signin' | 'signup') => void;
}

interface ParsedTask {
  id: string;
  text: string;
  completed: boolean;
  level: number;
  priority?: 'high' | 'medium' | 'low';
  schedule?: Date;
  type: 'task' | 'header' | 'text';
  description?: string;
  attachments?: string[];
  lineIndex: number;
  originalLine: string;
}

export function TaskPreview({ 
  content, 
  onTaskToggle, 
  onStartTimer, 
  onContentChange, 
  isDarkMode = true,
  onAuthRequired
}: TaskPreviewProps) {
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [taskTimers, setTaskTimers] = useState<Record<string, { startTime: Date; elapsed: number; isRunning: boolean }>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showScrollControls, setShowScrollControls] = useState(false);

  // Check if content needs scrolling
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (scrollContainerRef.current) {
        const hasScroll = scrollContainerRef.current.scrollHeight > scrollContainerRef.current.clientHeight;
        setShowScrollControls(hasScroll);
      }
    };

    checkScrollNeeded();
    // Check again when content changes
    const timeoutId = setTimeout(checkScrollNeeded, 100);
    return () => clearTimeout(timeoutId);
  }, [content, isCollapsed]);

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollTop;
      const scrollAmount = 120; // Scroll amount in pixels
      scrollContainerRef.current.scrollTop = Math.max(0, currentScroll - scrollAmount);
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollTop;
      const scrollAmount = 120; // Scroll amount in pixels
      const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTop = Math.min(maxScroll, currentScroll + scrollAmount);
    }
  };

  const parseContent = (content: string): ParsedTask[] => {
    const lines = content.split('\n');
    const tasks: ParsedTask[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Headers
      if (trimmed.startsWith('#')) {
        tasks.push({
          id: `header-${index}`,
          text: trimmed.replace(/^#+\s*/, ''),
          completed: false,
          level: trimmed.match(/^#+/)?.[0].length || 1,
          type: 'header',
          lineIndex: index,
          originalLine: line
        });
        return;
      }
      
      // Tasks with checkbox
      if (trimmed.match(/^--?\s*\[[ x]\]/)) {
        const completed = trimmed.includes('[x]');
        const level = trimmed.startsWith('--') ? 1 : 0;
        let text = trimmed.replace(/^--?\s*\[[ x]\]\s*/, '');
        
        // Extract schedule
        const scheduleMatch = text.match(/@(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?)/);
        const schedule = scheduleMatch ? new Date(scheduleMatch[1]) : undefined;
        if (schedule) {
          text = text.replace(scheduleMatch[0], '');
        }
        
        // Extract priority
        let priority: 'high' | 'medium' | 'low' | undefined;
        if (text.includes('🔥') || text.toLowerCase().includes('high')) priority = 'high';
        else if (text.includes('⚡') || text.toLowerCase().includes('medium')) priority = 'medium';
        else if (text.includes('📝') || text.toLowerCase().includes('low')) priority = 'low';
        
        tasks.push({
          id: `task-${index}`,
          text: text.trim(),
          completed,
          level,
          priority,
          schedule,
          type: 'task',
          lineIndex: index,
          originalLine: line
        });
        return;
      }
      
      // Regular tasks
      if (trimmed.startsWith('- ') || trimmed.startsWith('-- ')) {
        const level = trimmed.startsWith('-- ') ? 1 : 0;
        let text = trimmed.replace(/^--?\s*/, '');
        
        // Extract schedule
        const scheduleMatch = text.match(/@(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?)/);
        const schedule = scheduleMatch ? new Date(scheduleMatch[1]) : undefined;
        if (schedule) {
          text = text.replace(scheduleMatch[0], '');
        }
        
        // Extract priority
        let priority: 'high' | 'medium' | 'low' | undefined;
        if (text.includes('🔥') || text.toLowerCase().includes('high')) priority = 'high';
        else if (text.includes('⚡') || text.toLowerCase().includes('medium')) priority = 'medium';
        else if (text.includes('📝') || text.toLowerCase().includes('low')) priority = 'low';
        
        tasks.push({
          id: `task-${index}`,
          text: text.trim(),
          completed: false,
          level,
          priority,
          schedule,
          type: 'task',
          lineIndex: index,
          originalLine: line
        });
        return;
      }
      
      // Regular text
      if (trimmed && !trimmed.startsWith('---') && !trimmed.startsWith('*')) {
        tasks.push({
          id: `text-${index}`,
          text: trimmed,
          completed: false,
          level: 0,
          type: 'text',
          lineIndex: index,
          originalLine: line
        });
      }
    });
    
    return tasks;
  };

  const tasks = parseContent(content);
  
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return <Flame className="w-4 h-4 text-red-400" />;
      case 'medium': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'low': return <FileText className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (isDarkMode) {
      switch (priority) {
        case 'high': return 'border-l-red-400 bg-red-950/20';
        case 'medium': return 'border-l-yellow-400 bg-yellow-950/20';
        case 'low': return 'border-l-gray-400 bg-gray-800/20';
        default: return 'border-l-blue-400 bg-blue-950/20';
      }
    } else {
      switch (priority) {
        case 'high': return 'border-l-red-500 bg-red-50';
        case 'medium': return 'border-l-yellow-500 bg-yellow-50';
        case 'low': return 'border-l-gray-500 bg-gray-50';
        default: return 'border-l-blue-500 bg-blue-50';
      }
    }
  };

  const handleTaskClick = (task: ParsedTask) => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }

    if (task.type !== 'task' || !onContentChange) return;

    const lines = content.split('\n');
    const line = lines[task.lineIndex];
    
    let newLine: string;
    
    if (line.includes('[ ]') || line.includes('[x]')) {
      // Toggle checkbox task
      if (task.completed) {
        newLine = line.replace('[x]', '[ ]');
      } else {
        newLine = line.replace('[ ]', '[x]');
      }
    } else {
      // Convert regular task to checkbox task
      if (line.trim().startsWith('- ')) {
        newLine = line.replace('- ', '- [x] ');
      } else if (line.trim().startsWith('-- ')) {
        newLine = line.replace('-- ', '-- [x] ');
      } else {
        return;
      }
    }
    
    lines[task.lineIndex] = newLine;
    const newContent = lines.join('\n');
    onContentChange(newContent);
    
    if (onTaskToggle) {
      onTaskToggle(task.id, !task.completed);
    }
  };

  const startTaskTimer = (taskId: string) => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }

    setTaskTimers(prev => ({
      ...prev,
      [taskId]: {
        startTime: new Date(),
        elapsed: prev[taskId]?.elapsed || 0,
        isRunning: true
      }
    }));
    
    if (onStartTimer) {
      onStartTimer(taskId);
    }
  };

  const stopTaskTimer = (taskId: string) => {
    setTaskTimers(prev => {
      const timer = prev[taskId];
      if (!timer) return prev;
      
      return {
        ...prev,
        [taskId]: {
          ...timer,
          elapsed: timer.elapsed + (Date.now() - timer.startTime.getTime()),
          isRunning: false
        }
      };
    });
  };

  const formatElapsedTime = (elapsed: number, startTime?: Date) => {
    let totalMs = elapsed;
    if (startTime) {
      totalMs += Date.now() - startTime.getTime();
    }
    
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update timers every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTaskTimers(prev => ({ ...prev })); // Force re-render
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const containerClasses = isDarkMode
    ? 'h-full flex flex-col bg-gray-850 group'
    : 'h-full flex flex-col bg-gray-50 group';

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0'
    : 'h-12 bg-white border-b border-gray-300 flex items-center justify-between px-4 flex-shrink-0';

  const scrollButtonClasses = isDarkMode
    ? 'p-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white transition-all duration-200 shadow-lg'
    : 'p-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-200 shadow-lg';

  const textClasses = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedTextClasses = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={containerClasses} style={{
      width: '100%',
      maxWidth: '800px',
      height: '800px',
      maxHeight: '800px',
      minHeight: '400px', // Minimum height for mobile
      margin: '0 auto' // Center the container
    }}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <span className="text-sm font-medium">Task Preview</span>
          {!user && (
            <button
              onClick={() => onAuthRequired && onAuthRequired('signin')}
              className="flex items-center space-x-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-xs ${mutedTextClasses}`}>
            {tasks.filter(t => t.type === 'task').length} tasks • {tasks.filter(t => t.type === 'task' && t.completed).length} completed
          </div>
          {/* Mobile collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`md:hidden p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title={isCollapsed ? "Show tasks" : "Hide tasks"}
          >
            {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Content - Fixed height with proper scrolling */}
      <div className={`flex-1 ${isCollapsed ? 'hidden md:block' : 'block'} overflow-hidden relative`}>
        {/* Desktop Scroll Controls - Show on hover */}
        {showScrollControls && !isCollapsed && (
          <div className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2 flex-col space-y-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={scrollUp}
              className={`${scrollButtonClasses} rounded-t-lg`}
              title="Scroll up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={scrollDown}
              className={`${scrollButtonClasses} rounded-b-lg`}
              title="Scroll down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto p-4 space-y-2"
          style={{
            scrollBehavior: 'smooth',
            // Ensure proper scrolling
            overflowY: 'auto',
            maxHeight: '100%'
          }}
        >
          {tasks.map((task) => {
            if (task.type === 'header') {
              return (
                <div
                  key={task.id}
                  className={`font-bold ${textClasses} ${
                    task.level === 1 ? 'text-xl' : 
                    task.level === 2 ? 'text-lg' : 'text-base'
                  } ${task.level === 1 ? 'mt-6 mb-3' : 'mt-4 mb-2'}`}
                >
                  {task.text}
                </div>
              );
            }
            
            if (task.type === 'task') {
              const timer = taskTimers[task.id];
              const hoverClasses = isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100';
              
              return (
                <div
                  key={task.id}
                  className={`group flex items-start space-x-3 p-3 rounded-lg border-l-2 ${getPriorityColor(task.priority)} ${
                    task.level > 0 ? 'ml-6' : ''
                  } transition-all duration-200 ${hoverClasses} ${user ? 'cursor-pointer' : 'cursor-pointer'}`}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                  onClick={() => handleTaskClick(task)}
                >
                  <button 
                    className={`mt-0.5 transition-colors flex-shrink-0 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-green-400' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className={`break-words ${
                      task.completed 
                        ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}` 
                        : textClasses
                    }`}>
                      {task.text}
                    </div>
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-3 text-xs flex-wrap">
                        {task.priority && (
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(task.priority)}
                            <span className={`capitalize ${mutedTextClasses}`}>{task.priority}</span>
                          </div>
                        )}
                        
                        {task.schedule && (
                          <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{format(task.schedule, 'MMM dd, HH:mm')}</span>
                          </div>
                        )}

                        {timer && (
                          <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatElapsedTime(timer.elapsed, timer.isRunning ? timer.startTime : undefined)}</span>
                          </div>
                        )}
                      </div>

                      {/* Timer controls - show on hover for incomplete tasks */}
                      {hoveredTask === task.id && !task.completed && user && (
                        <div className="flex items-center space-x-1">
                          {timer?.isRunning ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                stopTaskTimer(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                              title="Stop timer"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startTaskTimer(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                              title="Start timer for this task"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Auth prompt for non-authenticated users */}
                      {hoveredTask === task.id && !user && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAuthRequired) {
                                onAuthRequired('signin');
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                            title="Sign in to use timer"
                          >
                            <LogIn className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={task.id} className={`text-sm leading-relaxed pl-2 break-words ${mutedTextClasses}`}>
                {task.text}
              </div>
            );
          })}
          
          {tasks.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-full ${mutedTextClasses} py-12`}>
              <FileText className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">No tasks yet</p>
              <p className="text-sm text-center">
                {user 
                  ? "Start typing in the editor to see your tasks appear here"
                  : "Sign in to start creating and managing your tasks"
                }
              </p>
              {!user && (
                <button
                  onClick={() => onAuthRequired && onAuthRequired('signin')}
                  className="mt-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Get Started</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}