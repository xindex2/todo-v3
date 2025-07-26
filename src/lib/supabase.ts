import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with helpful error messages
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('- VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  console.error('');
  console.error('📋 To fix this:');
  console.error('1. Create a .env file in your project root');
  console.error('2. Add your Supabase credentials:');
  console.error('   VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('3. Restart your development server');
  
  throw new Error('Missing Supabase environment variables. Check console for details.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL environment variable.');
}

console.log('🔧 Initializing Supabase client...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 API Key configured:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
    }
  }
});

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
    
    if (error.message?.includes('Failed to fetch')) {
      console.error('🚨 CONNECTION TROUBLESHOOTING:');
      console.error('1. Check internet connection');
      console.error('2. Verify Supabase project URL is correct');
      console.error('3. Add http://localhost:5173 to Site URL in Supabase Dashboard:');
      console.error('   - Go to Authentication > Settings');
      console.error('   - Add http://localhost:5173 to Site URL');
      console.error('4. Check if Supabase project is paused or has billing issues');
    }
  } else {
    console.log('✅ Supabase connection successful');
  }
}).catch((error) => {
  console.error('❌ Supabase initialization error:', error);
});

// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  content?: string;
  is_shared: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  scheduled_date?: string;
  level: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TimerSession {
  id: string;
  user_id: string;
  task_id?: string;
  session_type: 'work' | 'break' | 'long_break';
  duration: number;
  completed: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface SharedLink {
  id: string;
  project_id: string;
  user_id: string;
  token: string;
  expires_at?: string;
  view_count: number;
  created_at: string;
}

export interface AppSettings {
  id: string;
  openrouter_api_key?: string;
  app_name?: string;
  maintenance_mode?: boolean;
  max_users?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCredentials {
  id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Enhanced error handling for CORS and network issues
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Supabase ${operation} error:`, error);
  
  if (error?.message?.includes('CORS')) {
    console.error('🚫 CORS error detected - check server configuration');
    console.error('Add http://localhost:5173 to Site URL in Supabase Dashboard');
    return { error: 'Network configuration error. Please try again.' };
  }
  
  if (error?.message?.includes('Failed to fetch')) {
    console.error('🌐 Network error detected');
    console.error('Check internet connection and Supabase configuration');
    return { error: 'Network error. Please check your connection.' };
  }
  
  return { error: error?.message || `${operation} failed` };
};

// Helper function for making authenticated requests with proper CORS headers
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Request failed:', error);
    throw error;
  }
};