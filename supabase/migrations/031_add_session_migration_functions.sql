-- Migration 031: Session Data Migration Functions
-- Migrates anonymous session data to a user account after login

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

  -- Remove remaining session follows (duplicates that already exist for user)
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

  -- Remove remaining session ratings (duplicates that already exist for user)
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

  -- Remove remaining session favorites (duplicates that already exist for user)
  DELETE FROM user_favorites
  WHERE session_id = p_session_id
    AND user_id IS NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
