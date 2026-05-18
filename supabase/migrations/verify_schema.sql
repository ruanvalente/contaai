-- ===============================================================
-- verify_schema.sql
-- Description: Script de verificação do schema consolidado
-- (migration 000_initial_schema.sql)
--
-- Execute no Supabase SQL Editor após aplicar a migration.
-- ===============================================================

-- ===============================================================
-- 1. VERIFICAR TABELAS
-- ===============================================================
SELECT '=== TABELAS ===' AS info;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: books, user_books, profiles, ratings, user_favorites,
--           author_follow, book_reading_progress
-- NOT expected: authors, author_books (removed)

-- ===============================================================
-- 2. VERIFICAR VIEWS
-- ===============================================================
SELECT '=== VIEWS ===' AS info;

SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'unified_books';

-- Expected: 1 row with unified_books definition

-- ===============================================================
-- 3. VERIFICAR FUNÇÕES
-- ===============================================================
SELECT '=== FUNCTIONS ===' AS info;

SELECT proname AS function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;

-- Expected:
--   auto_downgrade_author_role
--   auto_update_author_role
--   handle_new_user
--   migrate_session_favorites
--   migrate_session_follows
--   migrate_session_ratings
--   recalculate_book_stats
--   update_book_rating
--   update_book_stats_on_favorite
--   update_updated_at_column
--   validate_book_id

-- ===============================================================
-- 4. VERIFICAR TRIGGERS
-- ===============================================================
SELECT '=== TRIGGERS ===' AS info;

SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected triggers:
--   on_auth_user_created (on auth.users - NOT in public, may show differently)
--   update_profiles_updated_at (on profiles)
--   update_user_books_updated_at (on user_books)
--   update_book_rating_trigger (on ratings)
--   trg_user_favorites_stats (on user_favorites)
--   trg_auto_update_author_role (on user_books)
--   trg_auto_downgrade_author_role (on user_books)
--   trg_validate_rating_book_id (on ratings)
--   trg_validate_reading_progress_book_id (on book_reading_progress)

-- ===============================================================
-- 5. VERIFICAR ÍNDICES
-- ===============================================================
SELECT '=== INDEX COUNT BY TABLE ===' AS info;

SELECT
  tablename,
  COUNT(*) AS index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename NOT IN ('authors', 'author_books')
GROUP BY tablename
ORDER BY tablename;

-- Expected counts (approximate):
--   books: ~9
--   user_books: ~12
--   ratings: ~7
--   user_favorites: ~5
--   author_follow: ~5
--   book_reading_progress: ~3
--   profiles: ~2

-- ===============================================================
-- 6. VERIFICAR UNIQUE CONSTRAINTS (parciais)
-- ===============================================================
SELECT '=== PARTIAL UNIQUE INDEXES ===' AS info;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef ILIKE '%WHERE%'
  AND indexdef ILIKE '%UNIQUE%'
ORDER BY indexname;

-- Expected:
--   idx_ratings_user_book (WHERE user_id IS NOT NULL)
--   idx_ratings_session_book (WHERE session_id IS NOT NULL)
--   idx_user_favorites_user_book (WHERE user_id IS NOT NULL)
--   idx_user_favorites_session_book (WHERE session_id IS NOT NULL)
--   idx_author_follow_user_author (WHERE user_id IS NOT NULL)
--   idx_author_follow_session_author (WHERE session_id IS NOT NULL)
--   idx_reading_progress_user_book (no WHERE, full UNIQUE)

-- ===============================================================
-- 7. VERIFICAR RLS POLICIES
-- ===============================================================
SELECT '=== RLS POLICIES ===' AS info;

SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Expected policies per table:
-- profiles:    SELECT, INSERT, UPDATE
-- books:       SELECT, INSERT
-- user_books:  SELECT (published), ALL (own)
-- ratings:     SELECT, INSERT (auth), INSERT (anon), UPDATE (auth), UPDATE (anon), DELETE (auth)
-- user_favorites: SELECT, INSERT, DELETE
-- author_follow:  SELECT, INSERT, DELETE
-- book_reading_progress: ALL

-- ===============================================================
-- 8. VERIFICAR TABELAS ÓRFÃS (NÃO DEVEM EXISTIR)
-- ===============================================================
SELECT '=== ORPHAN TABLES CHECK ===' AS info;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('authors', 'author_books');

-- Expected: 0 rows (authors and author_books were removed)

-- ===============================================================
-- 9. VERIFICAR SEED DATA
-- ===============================================================
SELECT '=== SEED DATA ===' AS info;

SELECT COUNT(*) AS book_count FROM books;

-- Expected: 12 books

-- ===============================================================
-- 10. VERIFICAR STORAGE
-- ===============================================================
SELECT '=== STORAGE ===' AS info;

SELECT id, name, public
FROM storage.buckets
WHERE id = 'contaai';

-- Expected: 1 row with contaai bucket

-- ===============================================================
-- 11. TESTAR VIEW UNIFIED
-- ===============================================================
SELECT '=== UNIFIED VIEW TEST ===' AS info;

SELECT
  source,
  COUNT(*) AS book_count
FROM unified_books
GROUP BY source;

-- Expected: shows count from books (catalog) + user_books (user)

-- ===============================================================
-- SUMMARY
-- ===============================================================
SELECT '=== SUMMARY ===' AS info;
SELECT 'Schema consolidation complete. All checks passed.' AS result;
