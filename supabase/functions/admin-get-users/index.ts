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

    // Get all auth users first (this is the primary source of truth)
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users from auth system' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get profiles data
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // Continue without profiles data
    }

    // Merge auth users with profile data
    const mergedUsers = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id)
      
      return {
        id: authUser.id,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown User',
        email: authUser.email || 'No email',
        is_admin: profile?.is_admin || false,
        created_at: authUser.created_at,
        updated_at: profile?.updated_at || authUser.updated_at,
        email_confirmed: authUser.email_confirmed_at ? true : false,
        last_sign_in: authUser.last_sign_in_at,
        phone: authUser.phone,
        app_metadata: authUser.app_metadata,
        user_metadata: authUser.user_metadata,
        // Add profile status
        has_profile: !!profile
      }
    })

    // Sort by creation date (newest first)
    mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return new Response(
      JSON.stringify({ 
        users: mergedUsers,
        total_auth_users: authUsers.users.length,
        total_profiles: profiles?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin get users error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})