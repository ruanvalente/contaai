-- Migration: Add author stats (followers_count, favorites_count) to books
-- Feature: author-follow + book-stats

-- Add columns for counts
ALTER TABLE books ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_followers_count ON books(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_favorites_count ON books(favorites_count DESC);

-- Trigger function: Update book stats on favorite
CREATE OR REPLACE FUNCTION update_book_stats_on_favorite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books 
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE books 
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE id = OLD.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_favorites to update favorites_count
DROP TRIGGER IF EXISTS trg_user_favorites_stats ON user_favorites;
CREATE TRIGGER trg_user_favorites_stats
AFTER INSERT OR DELETE ON user_favorites
FOR EACH ROW EXECUTE FUNCTION update_book_stats_on_favorite();

-- Function to recalculate all book stats
CREATE OR REPLACE FUNCTION recalculate_book_stats()
RETURNS void AS $$
BEGIN
  UPDATE books b
  SET favorites_count = (
    SELECT COUNT(*) FROM user_favorites f WHERE f.book_id = b.id
  );
  UPDATE books b
  SET followers_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Initial calculation
SELECT recalculate_book_stats();

-- Note: author_follow trigger requires proper author_id mapping
-- Currently using string-based author names, placeholder left at 0