import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UpdateUserRequest {
  userId: string
  updates: {
    is_admin?: boolean
    full_name?: string
    email?: string
  }
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

    const { userId, updates }: UpdateUserRequest = await req.json()

    if (!userId || !updates) {
      return new Response(
        JSON.stringify({ error: 'User ID and updates are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update profile using service role
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update auth user if email changed
    if (updates.email) {
      const { error: authError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { email: updates.email }
      )

      if (authError) {
        console.error('Error updating auth user:', authError)
        // Don't fail the request if auth update fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin update user error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})