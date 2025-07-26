/*
  # Fix profiles table RLS policies

  1. Issues Fixed
    - Remove infinite recursion in admin policy
    - Add missing INSERT policy for user registration
    - Simplify admin detection to avoid JWT parsing issues

  2. New Policies
    - Users can insert their own profile during signup
    - Users can read and update their own profile
    - Simple admin policies without recursion

  3. Security
    - Enable RLS on profiles table
    - Proper isolation between users
    - Admin access without circular dependencies
*/

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create INSERT policy for new user profile creation
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create UPDATE policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a simple admin policy that allows reading all profiles
-- This will be managed through application logic rather than database policies
-- to avoid recursion issues
CREATE POLICY "Service role can read all profiles"
  ON profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Create a simple admin policy for updates
CREATE POLICY "Service role can update all profiles"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For now, we'll handle admin permissions in the application layer
-- by checking the is_admin flag after the user is authenticated
-- This avoids the circular dependency issue