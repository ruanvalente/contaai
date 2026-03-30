-- User Books table for story creation feature
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(status);
CREATE INDEX IF NOT EXISTS idx_user_books_reading_status ON user_books(reading_status);
CREATE INDEX IF NOT EXISTS idx_user_books_category ON user_books(category);
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_books_user_reading ON user_books(user_id, reading_status);

-- Row Level Security
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own books
DROP POLICY IF EXISTS "Users manage own books" ON user_books;
CREATE POLICY "Users manage own books" ON user_books
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Users can read published books from others
DROP POLICY IF EXISTS "Users can read published books" ON user_books;
CREATE POLICY "Users can read published books" ON user_books
  FOR SELECT
  USING (status = 'published');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
