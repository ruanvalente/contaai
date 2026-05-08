-- Migration: 030_add_user_role.sql
-- Adiciona coluna role para diferenciar leitores de autores

ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'reader'
CHECK (role IN ('reader', 'author'));

-- Atualizar automaticamente usuários com livros publicados para author
UPDATE profiles
SET role = 'author'
WHERE id IN (
  SELECT DISTINCT user_id
  FROM user_books
  WHERE status = 'published'
);

-- Trigger para auto-atualizar role quando um usuário publica um livro
CREATE OR REPLACE FUNCTION auto_update_author_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    UPDATE profiles
    SET role = 'author',
        updated_at = NOW()
    WHERE id = NEW.user_id
    AND role != 'author';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_update_author_role
AFTER INSERT OR UPDATE OF status ON user_books
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION auto_update_author_role();

-- Trigger para rebaixar role quando autor não tem mais livros publicados
CREATE OR REPLACE FUNCTION auto_downgrade_author_role()
RETURNS TRIGGER AS $$
DECLARE
  has_published_books BOOLEAN;
BEGIN
  IF OLD.status = 'published' THEN
    SELECT EXISTS (
      SELECT 1 FROM user_books
      WHERE user_id = OLD.user_id
      AND status = 'published'
      AND id != OLD.id
    ) INTO has_published_books;

    IF NOT has_published_books THEN
      UPDATE profiles
      SET role = 'reader',
          updated_at = NOW()
      WHERE id = OLD.user_id
      AND role = 'author';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_downgrade_author_role
AFTER UPDATE OF status OR DELETE ON user_books
FOR EACH ROW
WHEN (OLD.status = 'published')
EXECUTE FUNCTION auto_downgrade_author_role();
