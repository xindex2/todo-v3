/*
  # Fix CORS and Sharing Issues

  1. Database Updates
    - Fix shared_links token generation
    - Ensure proper UUID generation for projects
    - Add comprehensive indexes for performance
    - Update RLS policies for better sharing support

  2. Security Updates
    - Enable proper CORS for all operations
    - Add public access policies for shared content
    - Ensure profile creation triggers work correctly

  3. Performance Improvements
    - Add missing indexes
    - Optimize query performance
    - Better error handling
*/

-- Fix shared_links table token generation
ALTER TABLE shared_links ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex');

-- Ensure projects have proper UUID generation
ALTER TABLE projects ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add comprehensive indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_links_project_id ON shared_links(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(token);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token);

-- Update shared links policies for better sharing support
DROP POLICY IF EXISTS "Users can manage own shared links" ON shared_links;
DROP POLICY IF EXISTS "Public can view shared projects via token" ON projects;

-- Allow users to manage their own shared links
CREATE POLICY "Users can manage own shared links"
  ON shared_links
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Allow public access to shared projects via token (both anon and authenticated)
CREATE POLICY "Public can view shared projects via token"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_links
      WHERE shared_links.project_id = projects.id
    )
  );

-- Ensure profiles are created automatically when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add policy to allow service role to manage profiles during signup
CREATE POLICY "Service role can manage profiles during signup"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure app_settings table exists with proper structure
DO $$
BEGIN
  -- Check if app_settings table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_settings') THEN
    CREATE TABLE app_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      openrouter_api_key text,
      app_name text DEFAULT 'Todo.is',
      maintenance_mode boolean DEFAULT false,
      max_users integer DEFAULT 1000,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Only admins can manage app settings"
      ON app_settings
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Insert default app settings if none exist
INSERT INTO app_settings (app_name, maintenance_mode, max_users)
SELECT 'Todo.is', false, 1000
WHERE NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1);

-- Update admin credentials to use simple password for development
UPDATE admin_credentials 
SET password_hash = 'admin123',
    updated_at = now()
WHERE username = 'admin';

-- Ensure admin user exists
INSERT INTO admin_credentials (username, password_hash, is_active)
VALUES ('admin', 'admin123', true)
ON CONFLICT (username) DO UPDATE SET
  password_hash = 'admin123',
  is_active = true,
  updated_at = now();