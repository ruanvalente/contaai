-- ===============================================================
-- Migration: 042_normalize_user_favorites.sql
-- Description: Remove denormalized cache columns from user_favorites
--
-- As colunas book_title, book_author, book_cover_color, book_cover_url,
-- book_category eram cache desnormalizado para evitar JOINs.
-- Agora os metadados dos livros são obtidos via view unified_books.
-- ===============================================================

-- Remover colunas de cache
ALTER TABLE user_favorites
  DROP COLUMN IF EXISTS book_title,
  DROP COLUMN IF EXISTS book_author,
  DROP COLUMN IF EXISTS book_cover_color,
  DROP COLUMN IF EXISTS book_cover_url,
  DROP COLUMN IF EXISTS book_category;

-- ===============================================================
-- ROLLBACK
-- ===============================================================
-- ALTER TABLE user_favorites
--   ADD COLUMN book_title TEXT NOT NULL DEFAULT '',
--   ADD COLUMN book_author TEXT NOT NULL DEFAULT '',
--   ADD COLUMN book_cover_color TEXT,
--   ADD COLUMN book_cover_url TEXT,
--   ADD COLUMN book_category TEXT;
