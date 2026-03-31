-- Migration: 017_add_ratings_performance_indexes
-- Phase: 2 - Performance (High Priority)
-- Description: Add indexes for ratings table to optimize aggregation queries

-- Index for book rating aggregation (average rating calculation)
CREATE INDEX IF NOT EXISTS idx_ratings_book_rating 
ON ratings(book_id, rating)
WHERE book_id IS NOT NULL;

-- Ensure unique constraint for one rating per user per book (already added in 013, but ensure it exists)
-- This is a conditional unique index that allows NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_book_user_unique 
ON ratings(book_id, user_id)
WHERE book_id IS NOT NULL AND user_id IS NOT NULL;

-- Index for user rating history (user's rating activity)
CREATE INDEX IF NOT EXISTS idx_ratings_user_created 
ON ratings(user_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- Note: Index for recent ratings removed - cannot use NOW() in partial index predicate
-- as NOW() is not IMMUTABLE. Use application-level filtering or materialized views
-- if time-based filtering is required.

-- Rollback:
-- DROP INDEX IF EXISTS idx_ratings_book_rating;
-- DROP INDEX IF EXISTS idx_ratings_book_user_unique;
-- DROP INDEX IF EXISTS idx_ratings_user_created;
