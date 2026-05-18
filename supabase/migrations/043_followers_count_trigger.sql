-- ===============================================================
-- Migration: 043_followers_count_trigger.sql
-- Description: Trigger para manter followers_count atualizado
--
-- followers_count em books e user_books reflete quantos usuários
-- seguem o autor daquele livro (via author_follow).
-- ===============================================================

-- ---------------------------------------------------------------
-- Função: recalculate_author_followers_count
-- Recalcula followers_count para books/user_books de um autor
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_author_followers_count(p_author_name TEXT)
RETURNS void AS $$
DECLARE
  v_followers INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_followers
  FROM author_follow
  WHERE author_name = p_author_name;

  UPDATE books
  SET followers_count = v_followers
  WHERE author = p_author_name;

  UPDATE user_books
  SET followers_count = v_followers
  WHERE author = p_author_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- Função: update_followers_count_on_follow_change
-- Trigger function para manter followers_count sincronizado
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_followers_count_on_follow_change()
RETURNS TRIGGER AS $$
DECLARE
  v_author_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_author_name := NEW.author_name;
  ELSIF TG_OP = 'DELETE' THEN
    v_author_name := OLD.author_name;
  END IF;

  PERFORM recalculate_author_followers_count(v_author_name);

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- Trigger: trg_author_follow_followers_count
-- Mantém followers_count atualizado ao seguir/deixar de seguir
-- ---------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_author_follow_followers_count ON author_follow;
CREATE TRIGGER trg_author_follow_followers_count
  AFTER INSERT OR DELETE ON author_follow
  FOR EACH ROW
  EXECUTE FUNCTION update_followers_count_on_follow_change();

-- ---------------------------------------------------------------
-- Atualizar recalculate_book_stats para incluir followers_count
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_book_stats()
RETURNS void AS $$
BEGIN
  -- Recalcular ratings
  UPDATE books b
  SET rating = COALESCE(
    (SELECT AVG(rating)::DECIMAL(3,2) FROM ratings WHERE book_id = b.id), 0
  ),
  rating_count = (
    SELECT COUNT(*) FROM ratings WHERE book_id = b.id
  );

  UPDATE user_books ub
  SET rating = COALESCE(
    (SELECT AVG(rating)::DECIMAL(3,2) FROM ratings WHERE book_id = ub.id), 0
  ),
  rating_count = (
    SELECT COUNT(*) FROM ratings WHERE book_id = ub.id
  );

  -- Recalcular favorites_count
  UPDATE books b
  SET favorites_count = (
    SELECT COUNT(*) FROM user_favorites WHERE book_id = b.id
  );

  UPDATE user_books ub
  SET favorites_count = (
    SELECT COUNT(*) FROM user_favorites WHERE book_id = ub.id
  );

  -- Recalcular followers_count
  UPDATE books b
  SET followers_count = (
    SELECT COUNT(*) FROM author_follow WHERE author_name = b.author
  );

  UPDATE user_books ub
  SET followers_count = (
    SELECT COUNT(*) FROM author_follow WHERE author_name = ub.author
  );
END;
$$ LANGUAGE plpgsql;

-- ===============================================================
-- ROLLBACK
-- ===============================================================
-- DROP TRIGGER IF EXISTS trg_author_follow_followers_count ON author_follow;
-- DROP FUNCTION IF EXISTS update_followers_count_on_follow_change();
-- DROP FUNCTION IF EXISTS recalculate_author_followers_count(TEXT);
-- -- Reverter recalculate_book_stats() para versão anterior
