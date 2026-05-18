-- Migration: Create trigger to update book ratings automatically
-- Date: 2026-04-30

-- 1. Create function to update rating aggregates
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_book_id UUID;
  v_avg_rating DECIMAL(3,2);
  v_rating_count INTEGER;
BEGIN
  -- Get the book_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_book_id := OLD.book_id;
  ELSE
    v_book_id := NEW.book_id;
  END IF;

  -- Calculate new average and count
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(3,2), 0),
    COUNT(*)
  INTO v_avg_rating, v_rating_count
  FROM ratings
  WHERE book_id = v_book_id;

  -- Update books table if book exists there
  UPDATE books 
  SET rating = v_avg_rating, rating_count = v_rating_count
  WHERE id = v_book_id;

  -- Update user_books table if book exists there
  UPDATE user_books 
  SET rating = v_avg_rating, rating_count = v_rating_count
  WHERE id = v_book_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger
DROP TRIGGER IF EXISTS update_book_rating_trigger ON ratings;
CREATE TRIGGER update_book_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_book_rating();

-- 3. Update existing ratings (if any)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT book_id FROM ratings LOOP
    UPDATE books 
    SET rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) 
      FROM ratings 
      WHERE book_id = r.book_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE book_id = r.book_id
    )
    WHERE id = r.book_id;

    UPDATE user_books 
    SET rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) 
      FROM ratings 
      WHERE book_id = r.book_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE book_id = r.book_id
    )
    WHERE id = r.book_id;
  END LOOP;
END $$;
