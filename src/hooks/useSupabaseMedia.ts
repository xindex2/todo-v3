import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface MediaItem {
  id: string;
  title: string;
  type: 'music' | 'video';
  url: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
  isCustom: boolean;
}

interface DatabaseMediaItem {
  id: string;
  user_id: string;
  title: string;
  type: 'music' | 'video';
  url: string;
  artist?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseMedia() {
  const { user } = useAuth();
  const [customMusic, setCustomMusic] = useState<MediaItem[]>([]);
  const [customVideos, setCustomVideos] = useState<MediaItem[]>([]);
  const [aiQuotes, setAiQuotes] = useState<Array<{text: string; author: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadCustomMedia();
    } else {
      loadLocalData();
    }
    loadAIQuotes();
  }, [user]);

  const loadCustomMedia = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load custom media from database
      const { data, error } = await supabase
        .from('custom_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading custom media:', error);
        return;
      }

      const music: MediaItem[] = [];
      const videos: MediaItem[] = [];

      data?.forEach((item: DatabaseMediaItem) => {
        const mediaItem: MediaItem = {
          id: item.id,
          title: item.title,
          type: item.type,
          url: item.url,
          artist: item.artist,
          isCustom: true,
          thumbnail: getDefaultThumbnail(item.type),
          duration: 'Unknown'
        };

        if (item.type === 'music') {
          music.push(mediaItem);
        } else {
          videos.push(mediaItem);
        }
      });

      setCustomMusic(music);
      setCustomVideos(videos);
    } catch (error) {
      console.error('Error loading custom media:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    // Load from localStorage for guest users
    const savedMusic = localStorage.getItem('custom-music');
    const savedVideos = localStorage.getItem('custom-videos');
    
    if (savedMusic) {
      try {
        setCustomMusic(JSON.parse(savedMusic));
      } catch (error) {
        console.error('Error parsing saved music:', error);
      }
    }
    if (savedVideos) {
      try {
        setCustomVideos(JSON.parse(savedVideos));
      } catch (error) {
        console.error('Error parsing saved videos:', error);
      }
    }
  };

  const loadAIQuotes = () => {
    const savedAiQuotes = localStorage.getItem('ai-quotes');
    if (savedAiQuotes) {
      try {
        setAiQuotes(JSON.parse(savedAiQuotes));
      } catch (error) {
        console.error('Error parsing saved AI quotes:', error);
      }
    }
  };

  // Save to localStorage for guest users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('custom-music', JSON.stringify(customMusic));
    }
  }, [customMusic, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('custom-videos', JSON.stringify(customVideos));
    }
  }, [customVideos, user]);

  useEffect(() => {
    localStorage.setItem('ai-quotes', JSON.stringify(aiQuotes));
  }, [aiQuotes]);

  const addCustomMedia = async (media: Omit<MediaItem, 'id' | 'isCustom'>) => {
    const newMedia: MediaItem = {
      ...media,
      id: Date.now().toString(),
      isCustom: true,
      thumbnail: media.thumbnail || getDefaultThumbnail(media.type),
      duration: media.duration || 'Unknown'
    };

    if (user) {
      // Save to database
      try {
        const { data, error } = await supabase
          .from('custom_media')
          .insert({
            user_id: user.id,
            title: media.title,
            type: media.type,
            url: media.url,
            artist: media.artist
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving media to database:', error);
          throw error;
        }

        // Update local state with database ID
        newMedia.id = data.id;
      } catch (error) {
        console.error('Failed to save media to database:', error);
        // Fall back to local storage
      }
    }

    // Update local state
    if (media.type === 'music') {
      setCustomMusic(prev => [...prev, newMedia]);
    } else {
      setCustomVideos(prev => [...prev, newMedia]);
    }

    return newMedia;
  };

  const updateCustomMedia = async (id: string, updates: Partial<MediaItem>) => {
    if (user) {
      // Update in database
      try {
        const { error } = await supabase
          .from('custom_media')
          .update({
            title: updates.title,
            url: updates.url,
            type: updates.type,
            artist: updates.artist,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating media in database:', error);
          throw error;
        }
      } catch (error) {
        console.error('Failed to update media in database:', error);
      }
    }

    // Update local state
    setCustomMusic(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    setCustomVideos(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeCustomMedia = async (id: string, type: 'music' | 'video') => {
    if (user) {
      // Remove from database
      try {
        const { error } = await supabase
          .from('custom_media')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting media from database:', error);
          throw error;
        }
      } catch (error) {
        console.error('Failed to delete media from database:', error);
      }
    }

    // Update local state
    if (type === 'music') {
      setCustomMusic(prev => prev.filter(item => item.id !== id));
    } else {
      setCustomVideos(prev => prev.filter(item => item.id !== id));
    }
  };

  const addAIQuotes = (quotes: Array<{text: string; author: string}>) => {
    setAiQuotes(prev => [...prev, ...quotes]);
  };

  const getDefaultThumbnail = (type: 'music' | 'video') => {
    if (type === 'music') {
      return 'https://images.pexels.com/photos/3784324/pexels-photo-3784324.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
    } else {
      return 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
    }
  };

  return {
    customMusic,
    customVideos,
    aiQuotes,
    loading,
    addCustomMedia,
    updateCustomMedia,
    removeCustomMedia,
    addAIQuotes,
  };
}