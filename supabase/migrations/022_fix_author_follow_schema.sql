-- Migration: Fix author_follow to use author_name (TEXT) instead of UUID
-- Fixes issue where book.author is a string, not UUID reference

-- Drop and recreate table with TEXT column
DROP TABLE IF EXISTS author_follow;

CREATE TABLE author_follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, author_name)
);

-- Create index for text-based lookups
CREATE INDEX IF NOT EXISTS idx_author_follow_user ON author_follow(user_id);
CREATE INDEX IF NOT EXISTS idx_author_follow_author_name ON author_follow(author_name);

-- Enable RLS
ALTER TABLE author_follow ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their follows" ON author_follow FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their follows" ON author_follow FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their follows" ON author_follow FOR DELETE USING (auth.uid() = user_id);