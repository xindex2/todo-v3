import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session - simple and fast
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking initial session...');
        
        // Check if Supabase is properly configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.error('❌ Missing Supabase environment variables');
          console.error('Please check your .env file contains:');
          console.error('- VITE_SUPABASE_URL');
          console.error('- VITE_SUPABASE_ANON_KEY');
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
        } else {
          console.log('✅ Session check complete:', session ? 'User logged in' : 'No session');
        }
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Loading profile for user:', session.user.id);
          // Load profile in background, don't block the UI
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // Don't block the app, just continue without auth
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'User logged in' : 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Loading profile after auth change for user:', session.user.id);
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('📋 Loading profile for user:', userId);
      
      // Check network connectivity and Supabase configuration
      console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔧 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading profile:', error);
        
        // Provide specific error guidance
        if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          console.error('🌐 Network/CORS Error Detected:');
          console.error('1. Check your internet connection');
          console.error('2. Verify Supabase URL in .env file');
          console.error('3. Add http://localhost:5173 to Supabase Site URL settings');
          console.error('4. Check if Supabase project is active');
        }
        
        // Don't throw, just log and continue
      } else if (data) {
        console.log('✅ Profile loaded successfully:', data.full_name);
        setProfile(data);
      } else {
        console.log('ℹ️ No profile found, user may need to complete setup');
      }
    } catch (error: any) {
      console.error('❌ Error loading profile:', error);
      
      // Enhanced error handling for common issues
      if (error.message?.includes('Failed to fetch')) {
        console.error('🚨 FETCH ERROR TROUBLESHOOTING:');
        console.error('1. Environment Variables:');
        console.error('   - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'MISSING');
        console.error('   - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
        console.error('2. Network Issues:');
        console.error('   - Check internet connection');
        console.error('   - Verify firewall/proxy settings');
        console.error('3. Supabase Configuration:');
        console.error('   - Add http://localhost:5173 to Site URL in Supabase Dashboard');
        console.error('   - Verify project is not paused');
        console.error('   - Check API keys are correct');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
      // Check environment variables before attempting signup
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const error = new Error('Supabase configuration missing. Please check environment variables.');
        console.error('❌ Sign up error:', error);
        return { data: null, error };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      console.log('✅ Sign up successful:', data);

      // Create profile if user was created and signed in immediately
      if (data.user && data.session) {
        console.log('👤 Creating profile for new user:', data.user.id);
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              email: email,
            });
          
          if (profileError) {
            console.error('❌ Error creating profile:', profileError);
          } else {
            console.log('✅ Profile created successfully');
          }
        } catch (profileError) {
          console.error('❌ Error creating profile:', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      
      // Enhanced error handling
      if (error.message?.includes('Failed to fetch')) {
        console.error('🌐 Network error during sign up - check Supabase configuration');
      }
      
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      // Check environment variables before attempting signin
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const error = new Error('Supabase configuration missing. Please check environment variables.');
        console.error('❌ Sign in error:', error);
        return { data: null, error };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { data, error };
      }

      console.log('✅ Sign in successful:', data);
      return { data, error };
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      
      // Enhanced error handling
      if (error.message?.includes('Failed to fetch')) {
        console.error('🌐 Network error during sign in - check Supabase configuration');
      }
      
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Sign out successful');
      }
      
      return { error };
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      console.log('📝 Updating profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully');
      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      
      // Enhanced error handling
      if (error.message?.includes('Failed to fetch')) {
        console.error('🌐 Network error during profile update - check Supabase configuration');
      }
      
      return { data: null, error };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}