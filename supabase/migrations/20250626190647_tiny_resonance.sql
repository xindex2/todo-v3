/*
  # Fix Admin System and RLS Policies

  1. New Tables (if not exists)
    - `admin_credentials` - Admin login credentials
    - `admin_sessions` - Admin session tracking

  2. Security Updates
    - Drop and recreate policies to avoid conflicts
    - Enable RLS on new tables
    - Add proper admin access policies

  3. Configuration Updates
    - Add app configuration columns
    - Insert default admin user
    - Create performance indexes
*/

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin sessions table for tracking admin logins
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_credentials(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role can manage admin credentials" ON admin_credentials;
DROP POLICY IF EXISTS "Service role can manage admin sessions" ON admin_sessions;

-- Create policies for admin credentials (only accessible by service role)
CREATE POLICY "Service role can manage admin credentials"
  ON admin_credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for admin sessions
CREATE POLICY "Service role can manage admin sessions"
  ON admin_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add trigger for admin_credentials updated_at (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_admin_credentials_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_credentials_updated_at
      BEFORE UPDATE ON admin_credentials
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Update app_settings table to include more configuration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'app_name'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN app_name text DEFAULT 'Todo.is';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'maintenance_mode'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN maintenance_mode boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'max_users'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN max_users integer DEFAULT 1000;
  END IF;
END $$;

-- Create indexes for better performance (only if not exists)
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default admin user (password: Admin147@@)
-- Using bcrypt hash for 'Admin147@@'
INSERT INTO admin_credentials (username, password_hash) 
VALUES ('admin', '$2b$10$8K1p/a0dHTBS89jPXXeOdOXBh4a2FhxmXWwi5xJGE8L.dRtQy/iyC')
ON CONFLICT (username) DO NOTHING;

-- Insert default app settings if not exists
INSERT INTO app_settings (app_name, maintenance_mode, max_users)
SELECT 'Todo.is', false, 1000
WHERE NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1);