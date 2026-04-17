-- Migration: Add author stats to user_books
-- Feature: author-follow + book-stats

-- Add columns for counts
ALTER TABLE user_books ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE user_books ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_books_followers_count ON user_books(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_books_favorites_count ON user_books(favorites_count DESC);