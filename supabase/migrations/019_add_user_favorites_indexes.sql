-- Migration: 019_add_user_favorites_indexes
-- Phase: 3 - Architecture (Medium Priority)
-- Description: Add indexes for user_favorites table and prepare for future normalization

-- Add index for user + book_id lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_book 
ON user_favorites(user_id, book_id);

-- Add index for book_id lookups (when checking which users favorited a book)
CREATE INDEX IF NOT EXISTS idx_user_favorites_book 
ON user_favorites(book_id);

-- Add index for created_at ordering (recent favorites)
CREATE INDEX IF NOT EXISTS idx_user_favorites_created 
ON user_favorites(user_id, created_at DESC);

-- Note: Full normalization of user_favorites (removing duplicated book metadata)
-- is deferred to a future migration as it requires application layer changes
-- to fetch book data from the source tables instead of local columns.

-- Rollback:
-- DROP INDEX IF EXISTS idx_user_favorites_user_book;
-- DROP INDEX IF EXISTS idx_user_favorites_book;
-- DROP INDEX IF EXISTS idx_user_favorites_created;
