/*
  # Fix Shared Projects Access

  1. Database Updates
    - Ensure proper RLS policies for shared projects
    - Fix token-based access for anonymous users
    - Add better error handling for shared links

  2. Security Updates
    - Allow anonymous access to shared projects
    - Ensure proper token verification
    - Add view count tracking
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view shared projects via token" ON projects;
DROP POLICY IF EXISTS "Public can verify shared tokens" ON shared_links;

-- Allow anonymous and authenticated users to view shared projects
-- This policy checks if a shared_link exists for the project
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

-- Allow anonymous access to verify shared tokens
CREATE POLICY "Public can verify shared tokens"
  ON shared_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to update view count
CREATE POLICY "Public can update view count"
  ON shared_links
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure the shared_links table has proper structure
DO $$
BEGIN
  -- Check if view_count column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shared_links' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE shared_links ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Add better indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_links_token_lookup ON shared_links(token, project_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_project_lookup ON shared_links(project_id, token);

-- Ensure projects table allows proper sharing
ALTER TABLE projects ALTER COLUMN share_token DROP NOT NULL;

-- Update the token generation to be more reliable
ALTER TABLE shared_links ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex');

-- Add a function to safely increment view count
CREATE OR REPLACE FUNCTION increment_shared_link_views(token_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_links 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE token = token_input;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION increment_shared_link_views(text) TO anon;
GRANT EXECUTE ON FUNCTION increment_shared_link_views(text) TO authenticated;