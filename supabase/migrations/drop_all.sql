-- ===============================================================
-- drop_all.sql
-- Description: Remove ALL objects do schema public (tables, views,
-- functions, triggers) para permitir um reset completo do banco.
--
-- ATENÇÃO: Isso destrói TODOS os dados existentes.
-- Execute apenas em desenvolvimento ou após backup de produção.
-- ===============================================================

-- 1. Remover triggers
-- Nota: on_auth_user_created está no schema auth (auth.users),
-- não no public. Precisamos dropar explicitamente.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Triggers no schema public
DROP TRIGGER IF EXISTS trg_validate_reading_progress_book_id ON book_reading_progress;
DROP TRIGGER IF EXISTS trg_validate_rating_book_id ON ratings;
DROP TRIGGER IF EXISTS trg_auto_downgrade_author_role ON user_books;
DROP TRIGGER IF EXISTS trg_auto_update_author_role ON user_books;
DROP TRIGGER IF EXISTS trg_user_favorites_stats ON user_favorites;
DROP TRIGGER IF EXISTS update_book_rating_trigger ON ratings;
DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- 2. Remover funções
-- CASCADE é necessário para handle_new_user() pois o trigger
-- on_auth_user_created em auth.users depende dela.
DROP FUNCTION IF EXISTS migrate_session_follows(TEXT, UUID);
DROP FUNCTION IF EXISTS migrate_session_ratings(TEXT, UUID);
DROP FUNCTION IF EXISTS migrate_session_favorites(TEXT, UUID);
DROP FUNCTION IF EXISTS recalculate_book_stats();
DROP FUNCTION IF EXISTS validate_book_id();
DROP FUNCTION IF EXISTS auto_downgrade_author_role();
DROP FUNCTION IF EXISTS auto_update_author_role();
DROP FUNCTION IF EXISTS update_book_stats_on_favorite();
DROP FUNCTION IF EXISTS update_book_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Remover views
DROP VIEW IF EXISTS unified_books CASCADE;

-- 4. Remover tabelas (ordem correta: dependentes primeiro)
DROP TABLE IF EXISTS book_reading_progress CASCADE;
DROP TABLE IF EXISTS author_follow CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS user_books CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 5. Remover tabelas órfãs (caso ainda existam de migrations antigas)
DROP TABLE IF EXISTS author_books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;

-- 6. Remover índices que não são de constraints (os de constraint somem com as tabelas)
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_name_lookup;
DROP INDEX IF EXISTS idx_reading_progress_book_id;
DROP INDEX IF EXISTS idx_reading_progress_user_id;
DROP INDEX IF EXISTS idx_reading_progress_user_book;
DROP INDEX IF EXISTS idx_author_follow_session_lookup;
DROP INDEX IF EXISTS idx_author_follow_author_name;
DROP INDEX IF EXISTS idx_author_follow_user;
DROP INDEX IF EXISTS idx_author_follow_session_author;
DROP INDEX IF EXISTS idx_author_follow_user_author;
DROP INDEX IF EXISTS idx_user_favorites_session_lookup;
DROP INDEX IF EXISTS idx_user_favorites_created;
DROP INDEX IF EXISTS idx_user_favorites_book;
DROP INDEX IF EXISTS idx_user_favorites_user_id;
DROP INDEX IF EXISTS idx_user_favorites_session_book;
DROP INDEX IF EXISTS idx_user_favorites_user_book;
DROP INDEX IF EXISTS idx_ratings_session_id;
DROP INDEX IF EXISTS idx_ratings_user_created;
DROP INDEX IF EXISTS idx_ratings_book_rating;
DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS idx_ratings_book_id;
DROP INDEX IF EXISTS idx_ratings_session_book;
DROP INDEX IF EXISTS idx_ratings_user_book;
DROP INDEX IF EXISTS idx_user_books_author_lookup;
DROP INDEX IF EXISTS idx_user_books_favorites_count;
DROP INDEX IF EXISTS idx_user_books_followers_count;
DROP INDEX IF EXISTS idx_user_books_user_reading_status;
DROP INDEX IF EXISTS idx_user_books_user_category;
DROP INDEX IF EXISTS idx_user_books_status_published;
DROP INDEX IF EXISTS idx_user_books_user_published;
DROP INDEX IF EXISTS idx_user_books_user_reading;
DROP INDEX IF EXISTS idx_user_books_user_status;
DROP INDEX IF EXISTS idx_user_books_category;
DROP INDEX IF EXISTS idx_user_books_reading_status;
DROP INDEX IF EXISTS idx_user_books_status;
DROP INDEX IF EXISTS idx_user_books_user_id;
DROP INDEX IF EXISTS idx_books_favorites_count;
DROP INDEX IF EXISTS idx_books_followers_count;
DROP INDEX IF EXISTS idx_books_description_trgm;
DROP INDEX IF EXISTS idx_books_author_search;
DROP INDEX IF EXISTS idx_books_title_search;
DROP INDEX IF EXISTS idx_books_category_created;
DROP INDEX IF EXISTS idx_books_category_rating;
DROP INDEX IF EXISTS idx_books_rating_count;
DROP INDEX IF EXISTS idx_books_category;

-- 7. Remover políticas de storage (opcional - bucket permanece)
-- DROP POLICY IF EXISTS "Users can manage own files in contaai" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload to contaai" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read contaai" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'contaai';

-- 8. Verificação final
SELECT 'DROP COMPLETE' AS status;

-- Para confirmar que tudo foi removido:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
