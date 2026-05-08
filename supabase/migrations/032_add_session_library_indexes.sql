-- Migration: 032_add_session_library_indexes.sql
-- Purpose: Add performance indexes for anonymous session library queries

CREATE INDEX IF NOT EXISTS idx_user_favorites_session_lookup
ON user_favorites(session_id) WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_author_follow_session_lookup
ON author_follow(session_id) WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_name_lookup
ON profiles(LOWER(name));

CREATE INDEX IF NOT EXISTS idx_user_books_author_lookup
ON user_books(LOWER(author)) WHERE status = 'published';
