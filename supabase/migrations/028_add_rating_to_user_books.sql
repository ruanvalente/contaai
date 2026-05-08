-- Migration: Add rating columns to user_books table
-- Date: 2026-04-30

-- 1. Add rating columns to user_books
ALTER TABLE user_books ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE user_books ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Update unified_books view to use these columns
CREATE OR REPLACE VIEW unified_books AS
SELECT 
  'catalog'::TEXT AS source,
  id,
  title,
  author,
  cover_url,
  cover_color,
  description,
  category,
  pages AS page_count,
  rating,
  rating_count,
  review_count,
  created_at,
  NULL::UUID AS user_id,
  NULL::TEXT AS author_name,
  NULL::TEXT AS status,
  NULL::INT AS word_count,
  NULL::TIMESTAMPTZ AS published_at
FROM books
UNION ALL
SELECT 
  'user'::TEXT AS source,
  ub.id,
  ub.title,
  ub.author,
  ub.cover_url,
  ub.cover_color,
  NULL::TEXT AS description,
  ub.category,
  CEIL(ub.word_count / 500)::INT AS page_count,
  ub.rating,
  ub.rating_count,
  0 AS review_count,
  ub.created_at,
  ub.user_id,
  p.name AS author_name,
  ub.status,
  ub.word_count,
  ub.published_at
FROM user_books ub
LEFT JOIN profiles p ON ub.user_id = p.id
WHERE ub.status = 'published';

-- 3. Grant read access
GRANT SELECT ON unified_books TO authenticated;
GRANT SELECT ON unified_books TO anon;
