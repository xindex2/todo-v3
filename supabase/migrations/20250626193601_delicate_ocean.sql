/*
  # Fix verify_admin_login function

  1. Database Functions
    - Drop and recreate `verify_admin_login` function with proper column qualification
    - Fix ambiguous username column reference by using table prefix
    - Ensure proper password verification and session management

  2. Security
    - Maintain secure password verification
    - Return only necessary admin data
    - Update last_login timestamp on successful login
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS verify_admin_login(text, text);

-- Create the corrected verify_admin_login function
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
AS $$
BEGIN
  -- Verify credentials and return admin data
  RETURN QUERY
  SELECT 
    ac.id as admin_id,
    ac.username,
    ac.is_active,
    ac.last_login
  FROM admin_credentials ac
  WHERE ac.username = username_input 
    AND ac.password_hash = crypt(password_input, ac.password_hash)
    AND ac.is_active = true;
  
  -- Update last_login if credentials are valid
  IF FOUND THEN
    UPDATE admin_credentials 
    SET last_login = now(), updated_at = now()
    WHERE admin_credentials.username = username_input;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_admin_login(text, text) TO authenticated;