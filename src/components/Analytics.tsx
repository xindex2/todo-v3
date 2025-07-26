import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Target, Calendar, Award, Zap } from 'lucide-react';

interface AnalyticsProps {
  content: string;
  isDarkMode?: boolean;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  scheduled: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

interface DailyStats {
  date: string;
  completed: number;
  created: number;
}

export function Analytics({ content, isDarkMode = true }: AnalyticsProps) {
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    scheduled: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });

  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [focusTime, setFocusTime] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    analyzeContent(content);
    loadTimerData();
    calculateStreak();
  }, [content]);

  const analyzeContent = (content: string) => {
    const lines = content.split('\n');
    let stats: TaskStats = {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      scheduled: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Count tasks
      if (trimmed.startsWith('- ') || trimmed.startsWith('-- ') || trimmed.match(/^--?\s*\[[ x]\]/)) {
        stats.total++;
        
        // Check completion
        if (trimmed.includes('[x]')) {
          stats.completed++;
        } else {
          stats.pending++;
        }
        
        // Check priorities
        if (trimmed.includes('🔥') || trimmed.toLowerCase().includes('high')) {
          stats.highPriority++;
        } else if (trimmed.includes('⚡') || trimmed.toLowerCase().includes('medium')) {
          stats.mediumPriority++;
        } else if (trimmed.includes('📝') || trimmed.toLowerCase().includes('low')) {
          stats.lowPriority++;
        }
        
        // Check scheduling
        const scheduleMatch = trimmed.match(/@(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?)/);
        if (scheduleMatch) {
          stats.scheduled++;
          const taskDate = new Date(scheduleMatch[1]);
          if (taskDate < new Date() && !trimmed.includes('[x]')) {
            stats.overdue++;
          }
        }
      }
    });

    setTaskStats(stats);
  };

  const loadTimerData = () => {
    const timerData = localStorage.getItem('timer-data');
    if (timerData) {
      const data = JSON.parse(timerData);
      setFocusTime(data.totalFocusTime || 0);
      
      // Generate weekly stats from session history
      const sessions = data.sessionHistory || [];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const weeklyData = last7Days.map(date => {
        const daySessions = sessions.filter((session: any) => 
          new Date(session.startTime).toISOString().split('T')[0] === date
        );
        
        return {
          date,
          completed: daySessions.filter((s: any) => s.type === 'work').length,
          created: 0 // This would need to be tracked separately
        };
      });

      setWeeklyStats(weeklyData);
    }
  };

  const calculateStreak = () => {
    const timerData = localStorage.getItem('timer-data');
    if (timerData) {
      const data = JSON.parse(timerData);
      const sessions = data.sessionHistory || [];
      
      let currentStreak = 0;
      let currentDate = new Date();
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasSessions = sessions.some((session: any) => 
          new Date(session.startTime).toISOString().split('T')[0] === dateStr &&
          session.type === 'work'
        );
        
        if (hasSessions) {
          currentStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    }
  };

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
  const productivityScore = Math.round((completionRate + (focusTime / 10) + (streak * 5)) / 3);

  const containerClasses = isDarkMode
    ? 'h-full bg-gray-900 flex flex-col'
    : 'h-full bg-white flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4'
    : 'h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4';

  const cardClasses = isDarkMode
    ? 'bg-gray-800 rounded-lg p-6 border border-gray-700'
    : 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm';

  const textClasses = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedTextClasses = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <BarChart3 className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className="text-sm font-medium">Analytics Dashboard</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={cardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${mutedTextClasses}`}>Total Tasks</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{taskStats.total}</p>
              </div>
              <CheckCircle2 className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>

          <div className={cardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${mutedTextClasses}`}>Completion Rate</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={cardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${mutedTextClasses}`}>Focus Time</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{focusTime}h</p>
              </div>
              <Clock className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>

          <div className={cardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${mutedTextClasses}`}>Current Streak</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{streak} days</p>
              </div>
              <Award className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        {/* Charts and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Breakdown */}
          <div className={cardClasses}>
            <h3 className={`text-lg font-semibold mb-4 ${textClasses}`}>Task Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={mutedTextClasses}>Completed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={textClasses}>{taskStats.completed}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={mutedTextClasses}>Pending</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${taskStats.total > 0 ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={textClasses}>{taskStats.pending}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={mutedTextClasses}>Overdue</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${taskStats.total > 0 ? (taskStats.overdue / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={textClasses}>{taskStats.overdue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className={cardClasses}>
            <h3 className={`text-lg font-semibold mb-4 ${textClasses}`}>Priority Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className={mutedTextClasses}>High Priority</span>
                </div>
                <span className={textClasses}>{taskStats.highPriority}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className={mutedTextClasses}>Medium Priority</span>
                </div>
                <span className={textClasses}>{taskStats.mediumPriority}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className={mutedTextClasses}>Low Priority</span>
                </div>
                <span className={textClasses}>{taskStats.lowPriority}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className={cardClasses}>
          <h3 className={`text-lg font-semibold mb-4 ${textClasses}`}>Weekly Activity</h3>
          <div className="flex items-end space-x-2 h-32">
            {weeklyStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max(day.completed * 10, 4)}px`,
                    maxHeight: '80px'
                  }}
                />
                <span className={`text-xs mt-2 ${mutedTextClasses}`}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Score */}
        <div className={`${cardClasses} mt-6`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${textClasses}`}>Productivity Score</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={isDarkMode ? 'text-gray-700' : 'text-gray-300'}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - productivityScore / 100)}`}
                  className="text-blue-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${textClasses}`}>{productivityScore}</span>
              </div>
            </div>
            <p className={mutedTextClasses}>
              Based on completion rate, focus time, and consistency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}