-- Migration: Create author_follow system
-- Feature: author-follow

-- Table: authors
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  description TEXT,
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: author_books
CREATE TABLE IF NOT EXISTS author_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_color TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: author_follow (followers)
CREATE TABLE IF NOT EXISTS author_follow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, author_id)
);

-- Indexes for performance
CREATE INDEX idx_author_follow_user ON author_follow(user_id);
CREATE INDEX idx_author_follow_author ON author_follow(author_id);
CREATE INDEX idx_author_books_author ON author_books(author_id);

-- RLS Policies
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_follow ENABLE ROW LEVEL SECURITY;

-- Authors: public read, authenticated write
CREATE POLICY "Authors are public readable" ON authors FOR SELECT USING (true);
CREATE POLICY "Authors can be created by authenticated users" ON authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Author books: public read, authenticated write
CREATE POLICY "Author books are public readable" ON author_books FOR SELECT USING (true);
CREATE POLICY "Author books can be created by authenticated users" ON author_books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Author follow: users manage their own follows
CREATE POLICY "Users can view their follows" ON author_follow FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their follows" ON author_follow FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their follows" ON author_follow FOR DELETE USING (auth.uid() = user_id);