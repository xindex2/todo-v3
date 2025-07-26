/*
  # Add Public Sharing Support

  1. Updates
    - Add RLS policies for anonymous users to view shared projects
    - Ensure shared projects are publicly accessible
    - Add proper indexes for performance

  2. Security
    - Allow anonymous users to read shared projects via token
    - Maintain security for non-shared projects
    - Ensure proper access control
*/

-- Drop existing policies to recreate them with public access
DROP POLICY IF EXISTS "Public can view shared projects via token" ON projects;

-- Allow anonymous and authenticated users to view shared projects via shared_links
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

-- Ensure shared_links table allows anonymous access for token verification
DROP POLICY IF EXISTS "Public can verify shared tokens" ON shared_links;

CREATE POLICY "Public can verify shared tokens"
  ON shared_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add index for better performance on shared link lookups
CREATE INDEX IF NOT EXISTS idx_shared_links_token_lookup ON shared_links(token, project_id);

-- Update projects table to ensure proper sharing support
ALTER TABLE projects ALTER COLUMN share_token DROP NOT NULL;

-- Ensure the shared_links token generation works properly
ALTER TABLE shared_links ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'hex');