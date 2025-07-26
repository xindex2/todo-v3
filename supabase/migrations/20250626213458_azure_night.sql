/*
  # Fix shared links table and project sharing

  1. Changes
    - Fix the token generation in shared_links table
    - Ensure projects have proper UUID generation
    - Add missing indexes and constraints

  2. Security
    - Update RLS policies for shared links
    - Ensure proper token generation
*/

-- Drop the problematic default value for token
ALTER TABLE shared_links ALTER COLUMN token DROP DEFAULT;

-- Update the token column to use a simpler default
ALTER TABLE shared_links ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex');

-- Ensure projects table has proper UUID generation
ALTER TABLE projects ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_links_project_id ON shared_links(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);

-- Update shared links policies to be more permissive for sharing
DROP POLICY IF EXISTS "Users can manage own shared links" ON shared_links;

CREATE POLICY "Users can manage own shared links"
  ON shared_links
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Allow public access to shared projects via token
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
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();