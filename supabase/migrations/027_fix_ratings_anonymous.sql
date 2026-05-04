-- Migration: Fix ratings table for anonymous users
-- Date: 2026-04-30

-- 1. Drop old UNIQUE CONSTRAINT that requires user_id
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_book_id_user_id_key;

-- 2. Ensure the PRIMARY KEY exists (ratings_pkey)
-- If not exists, add one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'ratings' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE ratings ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 3. Make user_id nullable (done in 025, but ensure)
ALTER TABLE ratings ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add session_id column if not exists (done in 025, but ensure)
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS rated_by_type TEXT;

-- 5. Create partial unique indexes for upsert to work
-- For authenticated users
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_user_book 
  ON ratings (book_id, user_id) 
  WHERE user_id IS NOT NULL;

-- For anonymous users  
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_session_book 
  ON ratings (book_id, session_id) 
  WHERE session_id IS NOT NULL;

-- 6. Drop old RLS policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Public can view ratings" ON ratings;
DROP POLICY IF EXISTS "Users can insert own rating" ON ratings;
DROP POLICY IF EXISTS "Users can update own rating" ON ratings;
DROP POLICY IF EXISTS "Users can delete own rating" ON ratings;
DROP POLICY IF EXISTS "Allow anonymous insert ratings" ON ratings;
DROP POLICY IF EXISTS "Allow users to update own ratings" ON ratings;
DROP POLICY IF EXISTS "Allow public read ratings" ON ratings;

-- 7. Create proper RLS policies
-- Public read
CREATE POLICY "Public can view ratings" 
  ON ratings FOR SELECT 
  USING (true);

-- Authenticated insert
CREATE POLICY "Authenticated can insert ratings" 
  ON ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Anonymous insert
CREATE POLICY "Anonymous can insert ratings" 
  ON ratings FOR INSERT 
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Authenticated update
CREATE POLICY "Authenticated can update ratings" 
  ON ratings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Anonymous update (by session_id)
CREATE POLICY "Anonymous can update ratings" 
  ON ratings FOR UPDATE 
  USING (user_id IS NULL AND session_id IS NOT NULL);

-- 8. Remove FK constraint to books table
-- Since we use unified_books view (books + user_books),
-- the FK to books table alone is too restrictive
-- The application validates book existence via unified_books view
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'ratings' AND constraint_name = 'ratings_book_id_fkey'
  ) THEN
    ALTER TABLE ratings DROP CONSTRAINT ratings_book_id_fkey;
  END IF;
END $$;
