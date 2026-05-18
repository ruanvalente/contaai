-- ===============================================================
-- Migration: 000_initial_schema.sql
-- Description: Schema consolidado inicial do Conta.AI
-- 
-- Este arquivo substitui TODAS as 32 migrations anteriores
-- (001 a 032), consolidando em um único schema limpo e otimizado:
--   - Sem tabelas órfãs (authors, author_books removidas)
--   - Sem índices duplicados
--   - Triggers otimizados (rating atualiza apenas tabela correta)
--   - FKs substituídas por triggers de validação onde necessário
--   - RLS policies consolidadas (sem sobreposição)
--   - View unified_books atualizada
-- ===============================================================

-- ===============================================================
-- 1. EXTENSIONS
-- ===============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===============================================================
-- 2. TABELAS
-- ===============================================================

-- ---------------------------------------------------------------
-- 2.1. profiles (estende auth.users)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'author')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2.2. books (catálogo público)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  cover_color TEXT DEFAULT '#8B4513',
  description TEXT,
  category TEXT NOT NULL,
  pages INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2.3. user_books (livros criados por usuários)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  cover_color TEXT DEFAULT '#8B4513',
  content TEXT,
  content_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  reading_status TEXT DEFAULT 'none' CHECK (reading_status IN ('none', 'reading', 'completed')),
  reading_progress INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------
-- 2.4. ratings (avaliações de livros)
-- Nota: Sem FK para books/user_books porque ratings podem
-- referenciar ambas as tabelas. Validação feita via trigger.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  session_id TEXT,
  rated_by_type TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2.5. user_favorites (favoritos — metadados via unified_books)
-- Os metadados do livro (título, autor, capa, categoria) são
-- obtidos via JOIN com a view unified_books no repositório.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2.6. author_follow (seguir autores por nome)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS author_follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 2.7. book_reading_progress (progresso de leitura)
-- Nota: Sem FK para books/user_books porque pode referenciar
-- ambas as tabelas. Validação feita via trigger.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  current_position JSONB DEFAULT '{}',
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- ===============================================================
-- 3. UNIQUE CONSTRAINTS (parciais para suporte anonymous)
-- ===============================================================

-- ratings: único por usuário autenticado ou sessão
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_user_book
  ON ratings(book_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_session_book
  ON ratings(book_id, session_id)
  WHERE session_id IS NOT NULL;

-- user_favorites: único por usuário autenticado ou sessão
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_user_book
  ON user_favorites(user_id, book_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_session_book
  ON user_favorites(session_id, book_id)
  WHERE session_id IS NOT NULL;

-- author_follow: único por usuário autenticado ou sessão
CREATE UNIQUE INDEX IF NOT EXISTS idx_author_follow_user_author
  ON author_follow(user_id, author_name)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_author_follow_session_author
  ON author_follow(session_id, author_name)
  WHERE session_id IS NOT NULL;

-- book_reading_progress: único por usuário + livro
CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_progress_user_book
  ON book_reading_progress(user_id, book_id);

-- ===============================================================
-- 4. FUNÇÕES
-- ===============================================================

-- ---------------------------------------------------------------
-- 4.1. handle_new_user: cria profile automaticamente no signup
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 4.2. update_updated_at_column: atualiza updated_at
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------
-- 4.3. update_book_rating: recalcula rating agregado
-- Otimizado: atualiza apenas a tabela correta (books ou user_books)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_book_id UUID;
  v_avg_rating DECIMAL(3,2);
  v_rating_count INTEGER;
BEGIN
  v_book_id := COALESCE(NEW.book_id, OLD.book_id);

  SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0), COUNT(*)
  INTO v_avg_rating, v_rating_count
  FROM ratings
  WHERE book_id = v_book_id;

  -- Atualizar apenas a tabela onde o livro existe
  IF EXISTS (SELECT 1 FROM books WHERE id = v_book_id) THEN
    UPDATE books
    SET rating = v_avg_rating, rating_count = v_rating_count
    WHERE id = v_book_id;
  ELSIF EXISTS (SELECT 1 FROM user_books WHERE id = v_book_id) THEN
    UPDATE user_books
    SET rating = v_avg_rating, rating_count = v_rating_count
    WHERE id = v_book_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 4.4. update_book_stats_on_favorite: atualiza favorites_count
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_book_stats_on_favorite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE id = NEW.book_id;

    UPDATE user_books
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE books
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE id = OLD.book_id;

    UPDATE user_books
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE id = OLD.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------
-- 4.5. auto_update_author_role: promove a author quando publica
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- 4.6. auto_downgrade_author_role: rebaixa quando sem livros
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- 4.7. validate_book_id: trigger function para validar book_id
--      em ratings e book_reading_progress (referencia books OU user_books)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_book_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM books WHERE id = NEW.book_id
    UNION ALL
    SELECT 1 FROM user_books WHERE id = NEW.book_id
  ) THEN
    RAISE EXCEPTION 'book_id % does not exist in books or user_books', NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------
-- 4.8. recalculate_book_stats: recalcula estatísticas (manutenção)
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

  -- Recalcular followers_count (derivado de author_follow)
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

-- ---------------------------------------------------------------
-- 4.9. recalculate_author_followers_count: recalcula followers
--      de todos os livros de um autor específico
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_author_followers_count(p_author_name TEXT)
RETURNS void AS $$
DECLARE
  v_followers INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_followers
  FROM author_follow
  WHERE author_name = p_author_name;

  UPDATE books SET followers_count = v_followers WHERE author = p_author_name;
  UPDATE user_books SET followers_count = v_followers WHERE author = p_author_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 4.10. update_followers_count_on_follow_change: trigger function
--       mantém followers_count sincronizado com author_follow
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
-- 4.11. Funções de migração de sessão (anonymous → authenticated)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION migrate_session_follows(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE author_follow
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_id
    AND user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM author_follow af
      WHERE af.user_id = p_user_id
        AND af.author_name = author_follow.author_name
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM author_follow
  WHERE session_id = p_session_id
    AND user_id IS NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION migrate_session_ratings(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE ratings
  SET user_id = p_user_id, session_id = NULL, rated_by_type = 'user'
  WHERE session_id = p_session_id
    AND user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ratings r
      WHERE r.user_id = p_user_id
        AND r.book_id = ratings.book_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM ratings
  WHERE session_id = p_session_id
    AND user_id IS NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION migrate_session_favorites(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_favorites
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_id
    AND user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_favorites uf
      WHERE uf.user_id = p_user_id
        AND uf.book_id = user_favorites.book_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM user_favorites
  WHERE session_id = p_session_id
    AND user_id IS NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================
-- 5. TRIGGERS
-- ===============================================================

-- Trigger: criar profile no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: updated_at em profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: updated_at em user_books
DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: recalcular rating ao inserir/atualizar/deletar rating
DROP TRIGGER IF EXISTS update_book_rating_trigger ON ratings;
CREATE TRIGGER update_book_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_book_rating();

-- Trigger: atualizar favorites_count
DROP TRIGGER IF EXISTS trg_user_favorites_stats ON user_favorites;
CREATE TRIGGER trg_user_favorites_stats
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_book_stats_on_favorite();

-- Trigger: auto-promover a author
DROP TRIGGER IF EXISTS trg_auto_update_author_role ON user_books;
CREATE TRIGGER trg_auto_update_author_role
  AFTER INSERT OR UPDATE OF status ON user_books
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION auto_update_author_role();

-- Trigger: auto-rebaixar de author
DROP TRIGGER IF EXISTS trg_auto_downgrade_author_role ON user_books;
CREATE TRIGGER trg_auto_downgrade_author_role
  AFTER UPDATE OF status OR DELETE ON user_books
  FOR EACH ROW
  WHEN (OLD.status = 'published')
  EXECUTE FUNCTION auto_downgrade_author_role();

-- Trigger: validar book_id em ratings
DROP TRIGGER IF EXISTS trg_validate_rating_book_id ON ratings;
CREATE TRIGGER trg_validate_rating_book_id
  BEFORE INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION validate_book_id();

-- Trigger: validar book_id em book_reading_progress
DROP TRIGGER IF EXISTS trg_validate_reading_progress_book_id ON book_reading_progress;
CREATE TRIGGER trg_validate_reading_progress_book_id
  BEFORE INSERT OR UPDATE ON book_reading_progress
  FOR EACH ROW EXECUTE FUNCTION validate_book_id();

-- Trigger: atualizar followers_count ao seguir/deixar de seguir autor
DROP TRIGGER IF EXISTS trg_author_follow_followers_count ON author_follow;
CREATE TRIGGER trg_author_follow_followers_count
  AFTER INSERT OR DELETE ON author_follow
  FOR EACH ROW EXECUTE FUNCTION update_followers_count_on_follow_change();

-- ===============================================================
-- 6. VIEWS
-- ===============================================================

-- unified_books: view unificada de catálogo + user books
-- Atualizada com followers_count e favorites_count
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
  followers_count,
  favorites_count,
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
  ub.followers_count,
  ub.favorites_count,
  ub.created_at,
  ub.user_id,
  p.name AS author_name,
  ub.status,
  ub.word_count,
  ub.published_at
FROM user_books ub
LEFT JOIN profiles p ON ub.user_id = p.id
WHERE ub.status = 'published';

COMMENT ON VIEW unified_books IS
'Unified view combining catalog books (books table) and user-created books (user_books table). Use source column to differentiate: "catalog" for pre-seeded books, "user" for user-created content.';

-- Grant acesso à view
GRANT SELECT ON unified_books TO authenticated;
GRANT SELECT ON unified_books TO anon;

-- ===============================================================
-- 7. ÍNDICES DE PERFORMANCE (sem duplicações)
-- ===============================================================

-- 7.1. books
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_rating_count ON books(rating DESC, rating_count DESC) WHERE rating > 0;
CREATE INDEX IF NOT EXISTS idx_books_category_rating ON books(category, rating DESC) WHERE rating > 0;
CREATE INDEX IF NOT EXISTS idx_books_category_created ON books(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_search ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_search ON books USING gin (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_description_trgm ON books USING gin (description gin_trgm_ops) WHERE description IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_followers_count ON books(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_favorites_count ON books(favorites_count DESC);

-- 7.2. user_books
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(status);
CREATE INDEX IF NOT EXISTS idx_user_books_reading_status ON user_books(reading_status);
CREATE INDEX IF NOT EXISTS idx_user_books_category ON user_books(category);
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_books_user_reading ON user_books(user_id, reading_status);
CREATE INDEX IF NOT EXISTS idx_user_books_user_published ON user_books(user_id, published_at DESC NULLS LAST) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_books_status_published ON user_books(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_user_books_user_category ON user_books(user_id, category) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_user_books_user_reading_status ON user_books(user_id, reading_status, updated_at DESC) WHERE reading_status != 'none';
CREATE INDEX IF NOT EXISTS idx_user_books_followers_count ON user_books(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_books_favorites_count ON user_books(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_books_author_lookup ON user_books(LOWER(author)) WHERE status = 'published';

-- 7.3. ratings
CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_book_rating ON ratings(book_id, rating) WHERE book_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ratings_user_created ON ratings(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id) WHERE session_id IS NOT NULL;

-- 7.4. user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_book ON user_favorites(book_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created ON user_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_session_lookup ON user_favorites(session_id) WHERE user_id IS NULL;

-- 7.5. author_follow
CREATE INDEX IF NOT EXISTS idx_author_follow_user ON author_follow(user_id);
CREATE INDEX IF NOT EXISTS idx_author_follow_author_name ON author_follow(author_name);
CREATE INDEX IF NOT EXISTS idx_author_follow_session_lookup ON author_follow(session_id) WHERE user_id IS NULL;

-- 7.6. book_reading_progress
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON book_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON book_reading_progress(book_id);

-- 7.7. profiles
CREATE INDEX IF NOT EXISTS idx_profiles_name_lookup ON profiles(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role IS NOT NULL;

-- ===============================================================
-- 8. ROW LEVEL SECURITY (RLS) - POLICIES CONSOLIDADAS
-- ===============================================================

-- ---------------------------------------------------------------
-- 8.1. profiles
-- ---------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------
-- 8.2. books
-- ---------------------------------------------------------------
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Books are publicly readable" ON books;
CREATE POLICY "Books are publicly readable"
  ON books FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------------
-- 8.3. user_books
-- ---------------------------------------------------------------
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published books are publicly readable" ON user_books;
CREATE POLICY "Published books are publicly readable"
  ON user_books FOR SELECT
  TO public
  USING (status = 'published');

DROP POLICY IF EXISTS "Users manage own books" ON user_books;
CREATE POLICY "Users manage own books"
  ON user_books FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 8.4. ratings
-- ---------------------------------------------------------------
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ratings are publicly readable" ON ratings;
CREATE POLICY "Ratings are publicly readable"
  ON ratings FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert ratings" ON ratings;
CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous users can insert ratings" ON ratings;
CREATE POLICY "Anonymous users can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous can update own ratings" ON ratings;
CREATE POLICY "Anonymous can update own ratings"
  ON ratings FOR UPDATE
  USING (user_id IS NULL AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;
CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 8.5. user_favorites
-- ---------------------------------------------------------------
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert favorites" ON user_favorites;
CREATE POLICY "Users can insert favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ---------------------------------------------------------------
-- 8.6. author_follow
-- ---------------------------------------------------------------
ALTER TABLE author_follow ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author follows are publicly readable" ON author_follow;
CREATE POLICY "Author follows are publicly readable"
  ON author_follow FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert follows" ON author_follow;
CREATE POLICY "Users can insert follows"
  ON author_follow FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can delete own follows" ON author_follow;
CREATE POLICY "Users can delete own follows"
  ON author_follow FOR DELETE
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ---------------------------------------------------------------
-- 8.7. book_reading_progress
-- ---------------------------------------------------------------
ALTER TABLE book_reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own reading progress" ON book_reading_progress;
CREATE POLICY "Users manage own reading progress"
  ON book_reading_progress FOR ALL
  USING (auth.uid() = user_id);

-- ===============================================================
-- 9. STORAGE (bucket de avatares)
-- ===============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contaai',
  'contaai',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read contaai" ON storage.objects;
CREATE POLICY "Public read contaai" ON storage.objects
  FOR SELECT USING (bucket_id = 'contaai');

DROP POLICY IF EXISTS "Users can upload to contaai" ON storage.objects;
CREATE POLICY "Users can upload to contaai" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contaai'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can manage own files in contaai" ON storage.objects;
CREATE POLICY "Users can manage own files in contaai" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contaai'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- ===============================================================
-- 10. SEED DATA (catálogo inicial de livros)
-- ===============================================================

INSERT INTO books (title, author, cover_color, description, category, pages, rating, rating_count, review_count) VALUES
('O Último Suspiro', 'Maria Silva', '#8B4513', 'Uma jornada emocional através das memórias de uma família que enfrenta os desafios do tempo.', 'Drama', 320, 4.5, 234, 89),
('Noites de Luar', 'João Pedro', '#2F4F4F', 'Em um mundo onde a magia e a tecnologia coexistem, uma jovem bruxa precisa decidir seu destino.', 'Fantasy', 412, 4.8, 567, 234),
('Fragmentos do Amanhã', 'Ana Clara', '#800020', 'Num futuro distante, a humanidade colonizou Marte. Uma expedição científica revela sinais de vida.', 'Sci-Fi', 380, 4.3, 189, 67),
('O Caminho do Sucesso', 'Ricardo Borges', '#1E3A5F', 'Um guia prático para alcançar seus objetivos profissionais e pessoais.', 'Business', 256, 4.1, 445, 156),
('Travessias', 'Carla Mendes', '#4A4A4A', 'Uma coletânea de contos que exploram a condição humana em suas múltiplas dimensões.', 'Drama', 298, 4.6, 321, 112),
('Além das Estrelas', 'Pedro Henrique', '#4B0082', 'Uma expedição científica revela sinais de vida em um planeta distante.', 'Sci-Fi', 445, 4.7, 623, 278),
('O Reino Encantado', 'Fernanda Costa', '#228B22', 'Quando um jovem príncipe herda um reino em ruínas, ele deve encontrar três artefatos mágicos.', 'Fantasy', 512, 4.4, 456, 189),
('Geografia Global', 'Marcos Oliveira', '#CD853F', 'Uma exploração abrangente dos fenômenos geográficos que moldam nosso planeta.', 'Geography', 342, 4.2, 234, 78),
('Métodos de Aprendizagem', 'Juliana Santos', '#6B8E23', 'Descubra técnicas comprovadas cientificamente para melhorar sua memória e concentração.', 'Education', 224, 4.0, 567, 234),
('A Arte da Negociação', 'Roberto Almeida', '#8B0000', 'Aprenda os segredos das negociações bem-sucedidas com estratégias utilizadas por especialistas.', 'Business', 288, 4.5, 789, 345),
('Mundos Paralelos', 'Lucas Ferreira', '#483D8B', 'Um físico descobre como viajar entre realidades alternativas.', 'Sci-Fi', 398, 4.6, 412, 167),
('Lendas do Norte', 'Sofia Rodrigues', '#2F4F4F', 'Vikings, deuses nórdicos e aventuras épicas se encontram nesta narrativa.', 'Fantasy', 456, 4.9, 534, 223);

-- ===============================================================
-- ROLLBACK (para reverter este migration)
-- ===============================================================
-- Para dropar tudo e voltar ao estado vazio, execute:
--   1. DROP TRIGGER IF EXISTS trg_validate_reading_progress_book_id ON book_reading_progress;
--   2. DROP TRIGGER IF EXISTS trg_validate_rating_book_id ON ratings;
--   3. DROP TRIGGER IF EXISTS trg_auto_downgrade_author_role ON user_books;
--   4. DROP TRIGGER IF EXISTS trg_auto_update_author_role ON user_books;
--   5. DROP TRIGGER IF EXISTS trg_user_favorites_stats ON user_favorites;
--   6. DROP TRIGGER IF EXISTS update_book_rating_trigger ON ratings;
--   7. DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
--   8. DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
--   9. DROP VIEW IF EXISTS unified_books;
--  10. DROP TABLE IF EXISTS book_reading_progress CASCADE;
--  11. DROP TABLE IF EXISTS user_favorites CASCADE;
--  12. DROP TABLE IF EXISTS ratings CASCADE;
--  13. DROP TABLE IF EXISTS author_follow CASCADE;
--  14. DROP TABLE IF EXISTS user_books CASCADE;
--  15. DROP TABLE IF EXISTS books CASCADE;
--  16. DROP TABLE IF EXISTS profiles CASCADE;

