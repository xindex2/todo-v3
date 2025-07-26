import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface DatabaseStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalEvents: number;
  totalTimerSessions: number;
  totalSharedLinks: number;
  activeUsers: number;
  completedTasks: number;
  sharedProjects: number;
  todayEvents: number;
  todayTimerSessions: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const sessionToken = req.headers.get('x-admin-token')
    const adminData = req.headers.get('x-admin-data')
    
    if (!sessionToken || !adminData) {
      return new Response(
        JSON.stringify({ error: 'Admin session required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For development, we'll use simple session validation
    try {
      const admin = JSON.parse(adminData)
      if (!admin.id || !admin.username) {
        throw new Error('Invalid admin data')
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid session data' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get comprehensive database statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    // Execute all queries in parallel for better performance
    const [
      // Basic counts
      usersCount,
      projectsCount,
      tasksCount,
      eventsCount,
      timerSessionsCount,
      sharedLinksCount,
      
      // Additional stats
      completedTasksCount,
      sharedProjectsCount,
      todayEventsCount,
      todayTimerSessionsCount,
      activeUsersCount
    ] = await Promise.allSettled([
      // Basic counts
      supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseClient.from('projects').select('*', { count: 'exact', head: true }),
      supabaseClient.from('tasks').select('*', { count: 'exact', head: true }),
      supabaseClient.from('events').select('*', { count: 'exact', head: true }),
      supabaseClient.from('timer_sessions').select('*', { count: 'exact', head: true }),
      supabaseClient.from('shared_links').select('*', { count: 'exact', head: true }),
      
      // Additional stats
      supabaseClient.from('tasks').select('*', { count: 'exact', head: true }).eq('completed', true),
      supabaseClient.from('projects').select('*', { count: 'exact', head: true }).eq('is_shared', true),
      supabaseClient.from('events').select('*', { count: 'exact', head: true }).gte('event_date', todayISO),
      supabaseClient.from('timer_sessions').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO)
    ])

    // Helper function to safely extract count from settled promise
    const getCount = (result: PromiseSettledResult<any>): number => {
      if (result.status === 'fulfilled' && result.value?.count !== null) {
        return result.value.count
      }
      return 0
    }

    const stats: DatabaseStats = {
      totalUsers: getCount(usersCount),
      totalProjects: getCount(projectsCount),
      totalTasks: getCount(tasksCount),
      totalEvents: getCount(eventsCount),
      totalTimerSessions: getCount(timerSessionsCount),
      totalSharedLinks: getCount(sharedLinksCount),
      activeUsers: getCount(activeUsersCount),
      completedTasks: getCount(completedTasksCount),
      sharedProjects: getCount(sharedProjectsCount),
      todayEvents: getCount(todayEventsCount),
      todayTimerSessions: getCount(todayTimerSessionsCount),
    }

    // Log any failed queries for debugging
    const results = [
      usersCount, projectsCount, tasksCount, eventsCount, timerSessionsCount, sharedLinksCount,
      completedTasksCount, sharedProjectsCount, todayEventsCount, todayTimerSessionsCount, activeUsersCount
    ]
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Query ${index} failed:`, result.reason)
      }
    })

    return new Response(
      JSON.stringify({ stats }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin get database stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})