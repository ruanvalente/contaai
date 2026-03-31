-- Migration: 015_add_user_books_performance_indexes
-- Phase: 2 - Performance (High Priority)
-- Description: Add composite indexes for user_books table to optimize common query patterns

-- Index for user + published_at ordering (common for "my published books" listing)
CREATE INDEX IF NOT EXISTS idx_user_books_user_published 
ON user_books(user_id, published_at DESC NULLS LAST)
WHERE published_at IS NOT NULL;

-- Index for public book listings (status = 'published')
CREATE INDEX IF NOT EXISTS idx_user_books_status_published 
ON user_books(status, published_at DESC)
WHERE status = 'published';

-- Index for user + category filtering (authenticated user's books by category)
CREATE INDEX IF NOT EXISTS idx_user_books_user_category 
ON user_books(user_id, category)
WHERE status = 'published';

-- Index for user + reading_status (user's reading progress queries)
CREATE INDEX IF NOT EXISTS idx_user_books_user_reading_status 
ON user_books(user_id, reading_status, updated_at DESC)
WHERE reading_status != 'none';

-- Rollback:
-- DROP INDEX IF EXISTS idx_user_books_user_published;
-- DROP INDEX IF EXISTS idx_user_books_status_published;
-- DROP INDEX IF EXISTS idx_user_books_user_category;
-- DROP INDEX IF EXISTS idx_user_books_user_reading_status;
