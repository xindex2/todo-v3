import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Get analytics data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get user growth data (last 7 days)
    const { data: users } = await supabaseClient
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get projects data
    const { data: projects } = await supabaseClient
      .from('projects')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get timer sessions data
    const { data: sessions } = await supabaseClient
      .from('timer_sessions')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get top users with project and session counts
    const { data: topUsersData } = await supabaseClient
      .from('profiles')
      .select(`
        full_name,
        email,
        id
      `)
      .limit(10)

    // Process data for charts
    const userGrowth = processTimeSeriesData(users || [], 'created_at')
    const projectStats = processTimeSeriesData(projects || [], 'created_at')
    const sessionStats = processTimeSeriesData(sessions || [], 'created_at')

    // Get project and session counts for top users
    const topUsers = []
    if (topUsersData) {
      for (const user of topUsersData.slice(0, 5)) {
        const { data: userProjects } = await supabaseClient
          .from('projects')
          .select('id')
          .eq('user_id', user.id)

        const { data: userSessions } = await supabaseClient
          .from('timer_sessions')
          .select('id')
          .eq('user_id', user.id)

        topUsers.push({
          name: user.full_name,
          email: user.email,
          projects: userProjects?.length || 0,
          sessions: userSessions?.length || 0,
        })
      }
    }

    const analytics = {
      userGrowth,
      projectStats,
      sessionStats,
      topUsers,
    }

    return new Response(
      JSON.stringify({ analytics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin get analytics error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function processTimeSeriesData(data: any[], dateField: string) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  return last7Days.map(date => {
    const count = data.filter(item => 
      new Date(item[dateField]).toISOString().split('T')[0] === date
    ).length
    
    return { 
      date, 
      users: count, 
      projects: count, 
      sessions: count 
    }
  })
}