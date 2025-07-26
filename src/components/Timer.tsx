import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Target, X, BarChart3 } from 'lucide-react';
import { useSupabaseTimerSessions } from '../hooks/useSupabaseTimerSessions';
import { useAuth } from '../hooks/useAuth';

interface TimerSession {
  id: string;
  type: 'work' | 'break' | 'long_break';
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  taskId?: string;
}

interface TimerProps {
  activeTaskId?: string;
  onClose?: () => void;
  isDarkMode?: boolean;
}

export function Timer({ activeTaskId, onClose, isDarkMode = true }: TimerProps) {
  const { user } = useAuth();
  const { sessions, createSession, completeSession, getSessionStats } = useSupabaseTimerSessions();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break' | 'long_break'>('work');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [localStats, setLocalStats] = useState({
    sessionsCompleted: 0,
    totalFocusTime: 0,
    sessionHistory: [] as TimerSession[]
  });
  const intervalRef = useRef<NodeJS.Timeout>();

  const sessionConfig = {
    work: { duration: 25 * 60, label: 'Focus Time', icon: Target, color: 'text-red-400' },
    break: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'text-green-400' },
    'long_break': { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'text-blue-400' }
  };

  // Load saved data for guest users
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('timer-data');
      if (saved) {
        const data = JSON.parse(saved);
        setLocalStats({
          sessionsCompleted: data.sessionsCompleted || 0,
          totalFocusTime: data.totalFocusTime || 0,
          sessionHistory: data.sessionHistory || []
        });
      }
    }
  }, [user]);

  // Save data for guest users
  useEffect(() => {
    if (!user) {
      const data = {
        sessionsCompleted: localStats.sessionsCompleted,
        totalFocusTime: localStats.totalFocusTime,
        sessionHistory: localStats.sessionHistory
      };
      localStorage.setItem('timer-data', JSON.stringify(data));
    }
  }, [localStats, user]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    const endTime = new Date();
    
    if (user && currentSessionId) {
      // Complete session in database
      await completeSession(currentSessionId, endTime);
    } else {
      // Record completed session locally
      const completedSession: TimerSession = {
        id: Date.now().toString(),
        type: currentSession,
        duration: sessionConfig[currentSession].duration,
        completed: true,
        startTime: new Date(Date.now() - sessionConfig[currentSession].duration * 1000),
        endTime,
        taskId: activeTaskId
      };
      
      setLocalStats(prev => ({
        ...prev,
        sessionHistory: [completedSession, ...prev.sessionHistory.slice(0, 49)],
        sessionsCompleted: prev.sessionsCompleted + 1,
        totalFocusTime: currentSession === 'work' ? prev.totalFocusTime + 25 : prev.totalFocusTime
      }));
    }
    
    if (currentSession === 'work') {
      // Determine next session
      const completedSessions = user ? getSessionStats().todayWorkSessions : localStats.sessionsCompleted;
      const nextSession = (completedSessions + 1) % 4 === 0 ? 'long_break' : 'break';
      setCurrentSession(nextSession);
      setTimeLeft(sessionConfig[nextSession].duration);
    } else {
      setCurrentSession('work');
      setTimeLeft(sessionConfig.work.duration);
    }

    setCurrentSessionId(null);

    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${sessionConfig[currentSession].label} completed!`, {
        body: 'Time for your next session.',
        icon: '/vite.svg'
      });
    }
  };

  const toggleTimer = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    if (!isRunning) {
      // Start timer
      if (user) {
        const session = await createSession(
          currentSession,
          sessionConfig[currentSession].duration,
          new Date(),
          activeTaskId
        );
        if (session) {
          setCurrentSessionId(session.id);
        }
      }
    }
    
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionConfig[currentSession].duration);
    setCurrentSessionId(null);
  };

  const switchSession = (type: 'work' | 'break' | 'long_break') => {
    setCurrentSession(type);
    setTimeLeft(sessionConfig[type].duration);
    setIsRunning(false);
    setCurrentSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const progress = ((sessionConfig[currentSession].duration - timeLeft) / sessionConfig[currentSession].duration) * 100;
  const CurrentIcon = sessionConfig[currentSession].icon;

  const stats = user ? getSessionStats() : {
    todayWorkSessions: localStats.sessionHistory.filter(s => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return s.startTime >= today && s.type === 'work' && s.completed;
    }).length,
    todayFocusTime: localStats.sessionHistory.filter(s => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return s.startTime >= today && s.type === 'work' && s.completed;
    }).length * 25,
    totalSessions: localStats.sessionsCompleted,
    totalFocusTime: localStats.totalFocusTime
  };

  const displaySessions = user ? sessions : localStats.sessionHistory;

  const containerClasses = isDarkMode
    ? 'h-full bg-gray-800 flex flex-col'
    : 'h-full bg-white flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 border-b border-gray-700 flex items-center justify-between px-4'
    : 'h-12 border-b border-gray-300 flex items-center justify-between px-4';

  const cardClasses = isDarkMode
    ? 'bg-gray-700 rounded-lg p-3 md:p-4'
    : 'bg-gray-100 rounded-lg p-3 md:p-4';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className="text-sm font-medium">Pomodoro Timer</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Session History"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Close Timer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showHistory ? (
        /* Session History */
        <div className="flex-1 p-4 overflow-auto">
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Session History
          </h3>
          
          {/* Today's Summary */}
          <div className={`${cardClasses} mb-4`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Today's Progress
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Work Sessions</span>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.todayWorkSessions}
                </div>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Focus Time</span>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.todayFocusTime}m
                </div>
              </div>
            </div>
          </div>

          {/* Session List */}
          <div className="space-y-2">
            {displaySessions.slice(0, 20).map(session => (
              <div key={session.id} className={cardClasses}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {session.type === 'work' ? (
                      <Target className="w-4 h-4 text-red-400" />
                    ) : (
                      <Coffee className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sessionConfig[session.type].label}
                    </span>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDuration(session.duration)}
                  </div>
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {session.startTime.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Timer Display */
        <div className="flex-1 p-4 md:p-6">
          <div className="text-center mb-6 md:mb-8">
            <div className={`flex items-center justify-center mb-4 ${sessionConfig[currentSession].color}`}>
              <CurrentIcon className="w-5 md:w-6 h-5 md:h-6 mr-2" />
              <span className="text-base md:text-lg font-medium">{sessionConfig[currentSession].label}</span>
            </div>
            
            {activeTaskId && (
              <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Working on task
              </div>
            )}
            
            {/* Circular Progress */}
            <div className="relative w-32 md:w-48 h-32 md:h-48 mx-auto mb-4 md:mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={isDarkMode ? 'text-gray-700' : 'text-gray-300'}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className={sessionConfig[currentSession].color}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl md:text-4xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-6 md:mb-8">
              <button
                onClick={toggleTimer}
                className={`w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 md:w-5 h-4 md:h-5" /> : <Play className="w-4 md:w-5 h-4 md:h-5 ml-0.5" />}
              </button>

              <button
                onClick={resetTimer}
                className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                <RotateCcw className="w-3 md:w-4 h-3 md:h-4" />
              </button>
            </div>

            {/* Session Switcher */}
            <div className="grid grid-cols-3 gap-1 md:gap-2 mb-4 md:mb-6">
              {Object.entries(sessionConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => switchSession(key as any)}
                  className={`py-2 px-2 md:px-3 rounded text-xs font-medium transition-colors ${
                    currentSession === key
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{key === 'long_break' ? 'Long' : config.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className={`space-y-3 md:space-y-4 pt-3 md:pt-4 ${
            isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sessions Today
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white'  : 'text-gray-900'}`}>
                {stats.todayWorkSessions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Focus Time Today
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.todayFocusTime}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Sessions
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalSessions}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}