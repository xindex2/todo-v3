/*
  # Add custom media table for user-generated content

  1. New Tables
    - `custom_media`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `type` (text, enum: music, video)
      - `url` (text, YouTube URL)
      - `artist` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on custom_media table
    - Add policies for user data access
*/

-- Create custom_media table
CREATE TABLE IF NOT EXISTS custom_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('music', 'video')),
  url text NOT NULL,
  artist text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE custom_media ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_media
CREATE POLICY "Users can manage own custom media"
  ON custom_media
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_media_user_id ON custom_media(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_media_type ON custom_media(type);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_media_updated_at
  BEFORE UPDATE ON custom_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();