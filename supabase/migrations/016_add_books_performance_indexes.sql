-- Migration: 016_add_books_performance_indexes
-- Phase: 2 - Performance (High Priority)
-- Description: Add composite indexes for books table to optimize catalog queries

-- Enable pg_trgm extension for ILIKE pattern matching (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for "top rated" listings
CREATE INDEX IF NOT EXISTS idx_books_rating_count 
ON books(rating DESC, rating_count DESC)
WHERE rating > 0;

-- Index for category + rating combined filtering (e.g., "best dramas")
CREATE INDEX IF NOT EXISTS idx_books_category_rating 
ON books(category, rating DESC)
WHERE rating > 0;

-- Composite index for category + created_at (if not exists from previous migration)
CREATE INDEX IF NOT EXISTS idx_books_category_created 
ON books(category, created_at DESC);

-- GIN trigram indexes for fast ILIKE searches (if not exists from previous migration)
CREATE INDEX IF NOT EXISTS idx_books_title_search 
ON books USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_books_author_search 
ON books USING gin (author gin_trgm_ops);

-- Index for description full-text search (if needed for future feature)
CREATE INDEX IF NOT EXISTS idx_books_description_trgm 
ON books USING gin (description gin_trgm_ops)
WHERE description IS NOT NULL;

-- Rollback:
-- DROP INDEX IF EXISTS idx_books_rating_count;
-- DROP INDEX IF EXISTS idx_books_category_rating;
-- DROP INDEX IF EXISTS idx_books_category_created;
-- DROP INDEX IF EXISTS idx_books_title_search;
-- DROP INDEX IF EXISTS idx_books_author_search;
-- DROP INDEX IF EXISTS idx_books_description_trgm;
