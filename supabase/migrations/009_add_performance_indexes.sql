-- Migration: 009_add_performance_indexes
-- Description: Add composite and trigram indexes for better query performance

-- Composite index for category + created_at ordering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_books_category_created_at 
ON books(category, created_at DESC);

-- Enable pg_trgm extension for ILIKE pattern matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for faster ILIKE searches on text columns
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin (author gin_trgm_ops);

-- Index for ratings aggregation queries
CREATE INDEX IF NOT EXISTS idx_ratings_book_user ON ratings(book_id, user_id);

-- Rollback: 
-- DROP INDEX IF EXISTS idx_books_category_created_at;
-- DROP INDEX IF EXISTS idx_books_title_trgm;
-- DROP INDEX IF EXISTS idx_books_author_trgm;
-- DROP INDEX IF EXISTS idx_ratings_book_user;
