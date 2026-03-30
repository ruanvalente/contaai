-- Migration: 013_add_ratings_rls_policies
-- Phase: 1 - Security (Critical)
-- Description: Add Row Level Security policies for ratings table
-- Critical Issue: ratings table has RLS enabled but NO policies exist
-- Impact: Any authenticated user can read/update/delete any rating

-- Verify RLS is enabled
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings (public read)
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
CREATE POLICY "Anyone can view ratings"
ON ratings FOR SELECT
USING (true);

-- Policy: Users can insert their own ratings only
DROP POLICY IF EXISTS "Users can insert own rating" ON ratings;
CREATE POLICY "Users can insert own rating"
ON ratings FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND book_id IS NOT NULL
  AND rating >= 1
  AND rating <= 5
);

-- Policy: Users can update their own ratings only
DROP POLICY IF EXISTS "Users can update own rating" ON ratings;
CREATE POLICY "Users can update own rating"
ON ratings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own ratings only
DROP POLICY IF EXISTS "Users can delete own rating" ON ratings;
CREATE POLICY "Users can delete own rating"
ON ratings FOR DELETE
USING (auth.uid() = user_id);

-- Ensure unique constraint for one rating per user per book
-- First drop existing constraint if any
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_book_id_user_id_key;
ALTER TABLE ratings ADD CONSTRAINT ratings_book_id_user_id_key UNIQUE (book_id, user_id);

-- Rollback:
-- DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
-- DROP POLICY IF EXISTS "Users can insert own rating" ON ratings;
-- DROP POLICY IF EXISTS "Users can update own rating" ON ratings;
-- DROP POLICY IF EXISTS "Users can delete own rating" ON ratings;
-- ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_book_id_user_id_key;
