import { useState, useEffect } from 'react';
import { supabase, DatabaseEvent } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  color: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function useSupabaseEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const formattedEvents: Event[] = (data || []).map(dbEvent => ({
        id: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description,
        date: new Date(dbEvent.event_date),
        color: dbEvent.color,
        createdAt: new Date(dbEvent.created_at),
        updatedAt: dbEvent.updated_at ? new Date(dbEvent.updated_at) : undefined,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (title: string, date: Date, description?: string, color: string = '#3b82f6') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title,
          description,
          event_date: date.toISOString(),
          color,
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: new Date(data.event_date),
        color: data.color,
        createdAt: new Date(data.created_at),
      };

      setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          event_date: updates.date?.toISOString(),
          color: updates.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
      ).sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: loadEvents,
  };
}