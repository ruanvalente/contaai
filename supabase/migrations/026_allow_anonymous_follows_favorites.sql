-- Migration: Allow anonymous users to follow authors and favorite books
-- Date: 2026-04-30

-- ===========================================
-- 1. FIX author_follow TABLE
-- ===========================================

-- Make user_id nullable for anonymous users
ALTER TABLE author_follow ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id column for anonymous users
ALTER TABLE author_follow ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Drop old unique constraint
ALTER TABLE author_follow DROP CONSTRAINT IF EXISTS author_follow_user_id_author_name_key;

-- Add new unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_author_follow_user_author 
  ON author_follow(user_id, author_name) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_author_follow_session_author 
  ON author_follow(session_id, author_name) 
  WHERE session_id IS NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their follows" ON author_follow;
DROP POLICY IF EXISTS "Users can insert their follows" ON author_follow;
DROP POLICY IF EXISTS "Users can delete their follows" ON author_follow;

-- Create new RLS policies that allow anonymous
CREATE POLICY "Users can view follows" 
  ON author_follow FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can insert follows" 
  ON author_follow FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete follows" 
  ON author_follow FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ===========================================
-- 2. FIX user_favorites TABLE
-- ===========================================

-- Make user_id nullable for anonymous users
ALTER TABLE user_favorites ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id column for anonymous users
ALTER TABLE user_favorites ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Drop old unique constraint
ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS user_favorites_user_id_book_id_key;

-- Add new unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_user_book 
  ON user_favorites(user_id, book_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_session_book 
  ON user_favorites(session_id, book_id) 
  WHERE session_id IS NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;

-- Create new RLS policies
CREATE POLICY "Users can view favorites" 
  ON user_favorites FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can insert favorites" 
  ON user_favorites FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete favorites" 
  ON user_favorites FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );
