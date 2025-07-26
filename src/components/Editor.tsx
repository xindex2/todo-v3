import React, { useRef, useEffect, useState } from 'react';
import { Code2, Save, Download, Sparkles, HelpCircle, LogIn, ChevronUp, ChevronDown } from 'lucide-react';
import { AITaskGenerator } from './AITaskGenerator';
import { TaskGuide } from './TaskGuide';
import { useAuth } from '../hooks/useAuth';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  showLineNumbers?: boolean;
  isDarkMode?: boolean;
  onAuthRequired?: (action?: 'signin' | 'signup') => void;
}

export function Editor({ content, onChange, showLineNumbers = false, isDarkMode = true, onAuthRequired }: EditorProps) {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showScrollControls, setShowScrollControls] = useState(false);

  // Check if content needs scrolling
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (textareaRef.current) {
        const hasScroll = textareaRef.current.scrollHeight > textareaRef.current.clientHeight;
        setShowScrollControls(hasScroll);
      }
    };

    checkScrollNeeded();
    // Check again when content changes
    const timeoutId = setTimeout(checkScrollNeeded, 100);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const scrollUp = () => {
    if (textareaRef.current) {
      const currentScroll = textareaRef.current.scrollTop;
      const lineHeight = 24; // Approximate line height
      const scrollAmount = lineHeight * 5; // Scroll 5 lines at a time
      textareaRef.current.scrollTop = Math.max(0, currentScroll - scrollAmount);
    }
  };

  const scrollDown = () => {
    if (textareaRef.current) {
      const currentScroll = textareaRef.current.scrollTop;
      const lineHeight = 24; // Approximate line height
      const scrollAmount = lineHeight * 5; // Scroll 5 lines at a time
      const maxScroll = textareaRef.current.scrollHeight - textareaRef.current.clientHeight;
      textareaRef.current.scrollTop = Math.min(maxScroll, currentScroll + scrollAmount);
    }
  };

  const handleTextareaInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    if (!user) {
      e.preventDefault();
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return false;
    }
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!user) {
      e.preventDefault();
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired('signin');
      }
      return;
    }
    onChange(e.target.value);
  };

  const exportTasks = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAIGeneratorClick = () => {
    if (!user && onAuthRequired) {
      onAuthRequired('signin');
      return;
    }
    setShowAIGenerator(true);
  };

  const handleAITasksGenerated = (tasks: string[]) => {
    // Since we now return the full formatted content as a single string
    const newTasks = tasks[0] || '';
    const newContent = content ? `${content}\n\n${newTasks}` : newTasks;
    onChange(newContent);
    setShowAIGenerator(false);
  };

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0'
    : 'h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4 flex-shrink-0';

  const textareaClasses = isDarkMode
    ? `w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 border-none outline-none resize-none leading-relaxed ${
        showLineNumbers ? 'pl-12' : ''
      } ${!user ? 'cursor-pointer' : ''}`
    : `w-full bg-white text-gray-900 font-mono text-sm p-4 border-none outline-none resize-none leading-relaxed ${
        showLineNumbers ? 'pl-12' : ''
      } ${!user ? 'cursor-pointer' : ''}`;

  const lineNumberClasses = isDarkMode
    ? 'text-gray-500 text-sm font-mono leading-relaxed'
    : 'text-gray-400 text-sm font-mono leading-relaxed';

  const scrollButtonClasses = isDarkMode
    ? 'p-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white transition-all duration-200 shadow-lg'
    : 'p-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-200 shadow-lg';

  const getPlaceholderText = () => {
    if (user) {
      return `Start typing your tasks...

# Quick Syntax Guide:
- Task item
  -- Subtask (double dash)
- [ ] Checkbox task
- [x] Completed task
- Schedule: @2024-01-15 14:00
- Priority: 🔥 High, ⚡ Medium, 📝 Low

Press the Guide button for more help or use AI Generate for intelligent task creation!`;
    } else {
      return `Welcome to Todo.is! 

🔒 Sign in to start creating and managing your tasks

Features you'll unlock:
• AI-powered task generation
• Project sync across devices  
• Advanced analytics
• Project sharing
• Pomodoro timer
• Calendar integration

Click here or anywhere in this area to sign in and get started!

# Quick Preview:
- Task item
  -- Subtask (double dash)
- [ ] Checkbox task
- [x] Completed task`;
    }
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <Code2 className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className="text-sm font-medium">tasks.md</span>
          <div className={`w-2 h-2 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-pulse`} />
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => setShowGuide(true)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            } rounded transition-colors`}
            title="Task Writing Guide"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Guide</span>
          </button>
          <button
            onClick={handleAIGeneratorClick}
            className={`flex items-center space-x-1 px-2 md:px-3 py-1 text-xs rounded transition-all ${
              user 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
            title={user ? "Generate AI tasks" : "Sign in to use AI features"}
          >
            {user ? <Sparkles className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
            <span className="hidden sm:inline">{user ? 'AI Generate' : 'Sign In for AI'}</span>
            <span className="sm:hidden">{user ? 'AI' : 'Sign In'}</span>
          </button>
          <button
            onClick={exportTasks}
            className={`flex items-center space-x-1 px-2 py-1 text-xs ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            } rounded transition-colors`}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      
      {/* Editor Container - Fixed size with responsive behavior */}
      <div className="flex-1 relative overflow-hidden" style={{
        width: '100%',
        maxWidth: '800px',
        height: '800px',
        maxHeight: '800px',
        minHeight: '400px', // Minimum height for mobile
        margin: '0 auto' // Center the container
      }}>
        {/* Auth overlay for non-authenticated users */}
        {!user && (
          <div 
            className="absolute inset-0 z-10 bg-transparent cursor-pointer"
            onClick={() => onAuthRequired && onAuthRequired('signin')}
            title="Click to sign in and start creating tasks"
          />
        )}
        
        {/* Desktop Scroll Controls - Show on hover */}
        {showScrollControls && (
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
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleTextareaInteraction}
          onClick={handleTextareaInteraction}
          className={textareaClasses}
          placeholder={getPlaceholderText()}
          readOnly={!user}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            tabSize: 2,
            height: '100%',
            width: '100%',
            maxHeight: '100%',
            overflow: 'auto',
            scrollBehavior: 'smooth',
            // Fix scrolling issues
            overflowY: 'auto',
            overflowX: 'auto',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
        
        {/* Line numbers overlay */}
        {showLineNumbers && (
          <div className="absolute top-0 left-0 p-4 pointer-events-none overflow-hidden">
            <div className={lineNumberClasses}>
              {content.split('\n').map((_, index) => (
                <div key={index} className="h-6">
                  {String(index + 1).padStart(2, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Task Generator Modal */}
      {showAIGenerator && (
        <AITaskGenerator
          onTasksGenerated={handleAITasksGenerated}
          onClose={() => setShowAIGenerator(false)}
          onAuthRequired={onAuthRequired}
        />
      )}

      {/* Task Guide Modal */}
      {showGuide && (
        <TaskGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}