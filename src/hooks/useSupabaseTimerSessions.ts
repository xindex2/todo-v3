import { useState, useEffect } from 'react';
import { supabase, TimerSession as DatabaseTimerSession } from '../lib/supabase';
import { useAuth } from './useAuth';

interface TimerSession {
  id: string;
  type: 'work' | 'break' | 'long_break';
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  taskId?: string;
  createdAt: Date;
}

export function useSupabaseTimerSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadSessions();
    } else {
      setSessions([]);
      setLoading(false);
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100); // Limit to last 100 sessions

      if (error) throw error;

      const formattedSessions: TimerSession[] = (data || []).map(dbSession => ({
        id: dbSession.id,
        type: dbSession.session_type as 'work' | 'break' | 'long_break',
        duration: dbSession.duration,
        completed: dbSession.completed,
        startTime: new Date(dbSession.started_at),
        endTime: dbSession.ended_at ? new Date(dbSession.ended_at) : undefined,
        taskId: dbSession.task_id || undefined,
        createdAt: new Date(dbSession.created_at),
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading timer sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    type: 'work' | 'break' | 'long_break',
    duration: number,
    startTime: Date,
    taskId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId,
          session_type: type,
          duration,
          started_at: startTime.toISOString(),
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: TimerSession = {
        id: data.id,
        type: data.session_type as 'work' | 'break' | 'long_break',
        duration: data.duration,
        completed: data.completed,
        startTime: new Date(data.started_at),
        endTime: data.ended_at ? new Date(data.ended_at) : undefined,
        taskId: data.task_id || undefined,
        createdAt: new Date(data.created_at),
      };

      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (error) {
      console.error('Error creating timer session:', error);
      return null;
    }
  };

  const completeSession = async (id: string, endTime: Date) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('timer_sessions')
        .update({
          completed: true,
          ended_at: endTime.toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === id ? { ...s, completed: true, endTime } : s
      ));
    } catch (error) {
      console.error('Error completing timer session:', error);
    }
  };

  const getSessionStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(s => s.startTime >= today);
    const workSessions = todaySessions.filter(s => s.type === 'work' && s.completed);
    
    return {
      todayWorkSessions: workSessions.length,
      todayFocusTime: workSessions.reduce((total, s) => total + s.duration, 0) / 60, // in minutes
      totalSessions: sessions.filter(s => s.completed).length,
      totalFocusTime: sessions
        .filter(s => s.type === 'work' && s.completed)
        .reduce((total, s) => total + s.duration, 0) / 60, // in minutes
    };
  };

  return {
    sessions,
    loading,
    createSession,
    completeSession,
    getSessionStats,
    refreshSessions: loadSessions,
  };
}