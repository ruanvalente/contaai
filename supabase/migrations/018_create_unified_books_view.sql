-- Migration: 018_create_unified_books_view
-- Phase: 3 - Architecture (Medium Priority)
-- Description: Create a unified view for books combining catalog and user-created books
-- Benefit: Simplifies queries in the application layer, enables efficient pagination

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
  0 AS rating,
  0 AS rating_count,
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

-- Grant read access to authenticated users
GRANT SELECT ON unified_books TO authenticated;
GRANT SELECT ON unified_books TO anon;

-- Comment for documentation
COMMENT ON VIEW unified_books IS 
'Unified view combining catalog books (books table) and user-created books (user_books table). 
Use source column to differentiate: "catalog" for pre-seeded books, "user" for user-created content.';

-- Rollback:
-- DROP VIEW IF EXISTS unified_books;
-- REVOKE SELECT ON unified_books FROM authenticated;
-- REVOKE SELECT ON unified_books FROM anon;
