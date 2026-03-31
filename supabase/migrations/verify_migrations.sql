-- ============================================
-- VERIFICATION QUERIES - Conta.AI Database Optimization
-- Branch: feature/db-optimization
-- Date: 2026-03-30
-- ============================================

-- Run this file in Supabase SQL Editor to verify migrations were applied

-- ============================================
-- 1. CHECK RLS POLICIES (Migrations 013 & 014)
-- ============================================

SELECT 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename IN ('ratings', 'profiles')
ORDER BY tablename, policyname;

-- Expected: 
-- ratings: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- profiles: 3 policies (SELECT, INSERT, UPDATE)

-- ============================================
-- 2. CHECK INDEXES ON user_books (Migration 015)
-- ============================================

SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'user_books'
  AND indexname LIKE 'idx_user_books%';

-- Expected indexes:
-- idx_user_books_user_published
-- idx_user_books_status_published
-- idx_user_books_user_category
-- idx_user_books_user_reading_status

-- ============================================
-- 3. CHECK INDEXES ON books (Migration 016)
-- ============================================

SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'books'
  AND indexname LIKE 'idx_books%';

-- Expected indexes:
-- idx_books_rating_count
-- idx_books_category_rating
-- idx_books_title_search (GIN trigram)
-- idx_books_author_search (GIN trigram)
-- idx_books_description_trgm (GIN trigram)

-- ============================================
-- 4. CHECK INDEXES ON ratings (Migration 017)
-- ============================================

SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'ratings'
  AND indexname LIKE 'idx_ratings%';

-- Expected indexes:
-- idx_ratings_book_rating
-- idx_ratings_book_user_unique
-- idx_ratings_user_created

-- ============================================
-- 5. CHECK UNIFIED BOOKS VIEW (Migration 018)
-- ============================================

SELECT 
  viewname, 
  definition 
FROM pg_views 
WHERE viewname = 'unified_books';

-- Expected: 1 row with unified_books view definition

-- ============================================
-- 6. CHECK INDEXES ON user_favorites (Migration 019)
-- ============================================

SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'user_favorites'
  AND indexname LIKE 'idx_user_favorites%';

-- Expected indexes:
-- idx_user_favorites_user_book
-- idx_user_favorites_book
-- idx_user_favorites_created

-- ============================================
-- 7. SUMMARY COUNTS
-- ============================================

SELECT 
  'Total Indexes (public)' as metric, COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
UNION ALL
SELECT 
  'RLS Policies (public)' as metric, COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Views (public)' as metric, COUNT(*) as count
FROM pg_views
WHERE schemaname = 'public';

-- ============================================
-- 8. TEST UNIFIED VIEW (Migration 018)
-- ============================================

-- Test the unified_books view works correctly
SELECT 
  source,
  COUNT(*) as book_count,
  AVG(page_count) as avg_pages
FROM unified_books
GROUP BY source;

-- Expected: Shows count from books and user_books

-- ============================================
-- 9. TEST RLS IS WORKING (Migration 013)
-- ============================================

-- Check if ratings table has proper RLS
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'ratings';

-- Expected: rowsecurity = true

-- ============================================
-- 10. VERIFY UNIQUE CONSTRAINT (Migration 013)
-- ============================================

-- Check if unique constraint on ratings exists
SELECT 
  conname,
  contype
FROM pg_constraint
WHERE conrelid = 'ratings'::regclass
  AND conname LIKE '%book_id%user_id%';

-- Expected: unique constraint exists

-- ============================================
-- RESULTS INTERPRETATION
-- ============================================

-- If all queries return expected results, migrations were applied successfully.
-- 
-- If any query returns fewer results than expected:
-- 1. Check if migration was applied
-- 2. Review migration file for syntax errors
-- 3. Re-apply migration if needed

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To rollback specific migrations, run the ROLLBACK sections
-- from each migration file in reverse order (019 -> 018 -> ... -> 013)

-- Example rollback for migration 013:
-- DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
-- DROP POLICY IF EXISTS "Users can insert own rating" ON ratings;
-- DROP POLICY IF EXISTS "Users can update own rating" ON ratings;
-- DROP POLICY IF EXISTS "Users can delete own rating" ON ratings;
-- ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_book_id_user_id_key;
