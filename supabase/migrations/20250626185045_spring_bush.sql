/*
  # Add Admin Credentials Table

  1. New Tables
    - `admin_credentials`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text, encrypted)
      - `is_active` (boolean, default true)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on admin_credentials table
    - Add policies for admin access only
    - Insert default admin user

  3. Changes
    - Update app_settings to include more configuration options
    - Add admin session management
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

-- Enable RLS on admin_credentials
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy for admin credentials (only accessible by service role)
CREATE POLICY "Service role can manage admin credentials"
  ON admin_credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- Enable RLS on admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin sessions
CREATE POLICY "Service role can manage admin sessions"
  ON admin_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add trigger for admin_credentials updated_at
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Admin147@@)
-- Using bcrypt hash for 'Admin147@@'
INSERT INTO admin_credentials (username, password_hash) 
VALUES ('admin', '$2b$10$8K1p/a0dHTBS89jPXXeOdOXBh4a2FhxmXWwi5xJGE8L.dRtQy/iyC')
ON CONFLICT (username) DO NOTHING;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default app settings if not exists
INSERT INTO app_settings (app_name, maintenance_mode, max_users)
VALUES ('Todo.is', false, 1000)
ON CONFLICT DO NOTHING;