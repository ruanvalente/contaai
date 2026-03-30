-- Reading progress tracking table
CREATE TABLE IF NOT EXISTS book_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  current_position JSONB DEFAULT '{}',
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  UNIQUE(user_id, book_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON book_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON book_reading_progress(book_id);

-- Row Level Security
ALTER TABLE book_reading_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users manage their own reading progress
DROP POLICY IF EXISTS "Users manage own reading progress" ON book_reading_progress;
CREATE POLICY "Users manage own reading progress" ON book_reading_progress
  FOR ALL
  USING (auth.uid() = user_id);
