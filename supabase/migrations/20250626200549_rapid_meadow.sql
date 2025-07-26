-- Drop the existing function
DROP FUNCTION IF EXISTS verify_admin_login(text, text);

-- Update admin credentials with a simple password for development
-- Username: admin
-- Password: admin123
UPDATE admin_credentials 
SET password_hash = 'admin123',
    updated_at = now()
WHERE username = 'admin';

-- If no admin exists, create one
INSERT INTO admin_credentials (username, password_hash, is_active)
VALUES ('admin', 'admin123', true)
ON CONFLICT (username) DO UPDATE SET
  password_hash = 'admin123',
  is_active = true,
  updated_at = now();

-- Create a simple admin verification function
CREATE OR REPLACE FUNCTION verify_admin_login(
  username_input text,
  password_input text
)
RETURNS TABLE (
  admin_id uuid,
  username text,
  is_active boolean,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record admin_credentials%ROWTYPE;
BEGIN
  -- Get admin record with simple password check
  SELECT * INTO admin_record
  FROM admin_credentials
  WHERE admin_credentials.username = username_input 
    AND admin_credentials.password_hash = password_input
    AND admin_credentials.is_active = true;
  
  -- If admin found, update last login and return data
  IF admin_record.id IS NOT NULL THEN
    UPDATE admin_credentials
    SET last_login = now(),
        updated_at = now()
    WHERE id = admin_record.id;
    
    RETURN QUERY
    SELECT 
      admin_record.id,
      admin_record.username,
      admin_record.is_active,
      now()::timestamptz;
  END IF;
  
  -- Return empty if not found
  RETURN;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION verify_admin_login(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_login(text, text) TO anon;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anon to verify admin login" ON admin_credentials;

-- Add policy to allow anon users to call the function
CREATE POLICY "Allow anon to verify admin login"
  ON admin_credentials
  FOR SELECT
  TO anon
  USING (true);