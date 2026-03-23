TRUNCATE TABLE books RESTART IDENTITY CASCADE;
DROP INDEX IF EXISTS idx_books_rating;
DROP INDEX IF EXISTS idx_books_author;
DROP INDEX IF EXISTS idx_books_category;
DROP POLICY IF EXISTS "Allow authenticated insert" ON books;
DROP POLICY IF EXISTS "Allow public read access" ON books;
