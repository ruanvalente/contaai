-- Add session_id column to ratings table for anonymous users
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS rated_by_type TEXT DEFAULT 'user';

-- Make user_id nullable to support anonymous ratings
ALTER TABLE ratings ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing unique constraint
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_book_id_user_id_key;

-- Create unique index for logged-in users (user_id not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_user_book 
  ON ratings (book_id, user_id) 
  WHERE user_id IS NOT NULL;

-- Create unique index for anonymous users (session_id not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_session_book 
  ON ratings (book_id, session_id) 
  WHERE session_id IS NOT NULL;

-- Update existing rows to have rated_by_type = 'user'
UPDATE ratings SET rated_by_type = 'user' WHERE user_id IS NOT NULL;

-- Add RLS policy to allow anonymous ratings
DROP POLICY IF EXISTS "Allow anonymous insert ratings" ON ratings;
CREATE POLICY "Allow anonymous insert ratings" ON ratings
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own ratings
DROP POLICY IF EXISTS "Allow users to update own ratings" ON ratings;
CREATE POLICY "Allow users to update own ratings" ON ratings
  FOR UPDATE USING (
    (user_id = auth.uid()) OR 
    (session_id IS NOT NULL AND user_id IS NULL)
  );

-- Allow public read access to ratings
DROP POLICY IF EXISTS "Allow public read ratings" ON ratings;
CREATE POLICY "Allow public read ratings" ON ratings
  FOR SELECT USING (true);
