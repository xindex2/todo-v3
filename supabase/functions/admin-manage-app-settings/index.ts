import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-admin-data',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

interface AppSettingsRequest {
  openrouter_api_key?: string
  app_name?: string
  maintenance_mode?: boolean
  max_users?: number
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
    
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Admin session required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For development, we'll use a simple session validation
    // In production, this should verify against the admin_sessions table
    const adminData = req.headers.get('x-admin-data')
    if (!adminData) {
      return new Response(
        JSON.stringify({ error: 'Invalid session data' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle GET request - fetch settings
    if (req.method === 'GET') {
      const { data: settings, error } = await supabaseClient
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching settings:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch settings' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // If no settings exist, create default ones
      if (!settings) {
        const { data: newSettings, error: createError } = await supabaseClient
          .from('app_settings')
          .insert({
            app_name: 'Todo.is',
            maintenance_mode: false,
            max_users: 1000
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default settings:', createError)
          return new Response(
            JSON.stringify({ error: 'Failed to create default settings' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ settings: newSettings }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ settings }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle POST/PUT request - update settings
    if (req.method === 'POST' || req.method === 'PUT') {
      const updates: AppSettingsRequest = await req.json()

      // Get existing settings
      const { data: existingSettings } = await supabaseClient
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (existingSettings) {
        // Update existing settings
        const { data: updatedSettings, error } = await supabaseClient
          .from('app_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating settings:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update settings' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ settings: updatedSettings, message: 'Settings updated successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        // Create new settings
        const { data: newSettings, error } = await supabaseClient
          .from('app_settings')
          .insert({
            app_name: updates.app_name || 'Todo.is',
            maintenance_mode: updates.maintenance_mode || false,
            max_users: updates.max_users || 1000,
            openrouter_api_key: updates.openrouter_api_key
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating settings:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create settings' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ settings: newSettings, message: 'Settings created successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin manage app settings error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})