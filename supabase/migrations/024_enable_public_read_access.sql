-- Migration: 024 - Public Read Access for Published Books
-- Enable public read access to published books for anonymous users
-- Part of Phase 1: Public Reader Access

-- =====================================================
-- 1. Public Read Policy for Published Books
-- =====================================================

-- Drop existing policy if exists (for clean migration)
DROP POLICY IF EXISTS "Public can view published books" ON user_books;

-- Create public read policy for published books
-- USING clause applies to SELECT operations
CREATE POLICY "Public can view published books"
ON user_books FOR SELECT
TO public
USING (status = 'published');

-- =====================================================
-- 2. Ensure books table is also public (verify)
-- =====================================================

-- The books table should already be public, but let's verify
DROP POLICY IF EXISTS "Anyone can view catalog books" ON books;

CREATE POLICY "Anyone can view catalog books"
ON books FOR SELECT
TO public
USING (true);

-- =====================================================
-- 3. Author books public access
-- =====================================================

-- Ensure author_books is readable publicly
DROP POLICY IF EXISTS "Public can view author books" ON author_books;

CREATE POLICY "Public can view author books"
ON author_books FOR SELECT
TO public
USING (true);

-- Authors table public read
DROP POLICY IF EXISTS "Public can view authors" ON authors;

CREATE POLICY "Public can view authors"
ON authors FOR SELECT
TO public
USING (true);

-- =====================================================
-- 4. Author follow - public read, auth write
-- =====================================================

-- Allow public to view who is following whom (for showing follower counts)
DROP POLICY IF EXISTS "Public can view author follows" ON author_follow;

CREATE POLICY "Public can view author follows"
ON author_follow FOR SELECT
TO public
USING (true);

-- =====================================================
-- 5. Ratings - public read
-- =====================================================

-- Allow public to view ratings
DROP POLICY IF EXISTS "Public can view ratings" ON ratings;

CREATE POLICY "Public can view ratings"
ON ratings FOR SELECT
TO public
USING (true);

-- =====================================================
-- Verification
-- =====================================================

-- Test the policies are working:
-- SELECT * FROM user_books WHERE status = 'published' LIMIT 5;
-- SELECT * FROM books LIMIT 5;

COMMENT ON POLICY "Public can view published books" ON user_books IS 
'Enable anonymous access to published books for public reading experience';