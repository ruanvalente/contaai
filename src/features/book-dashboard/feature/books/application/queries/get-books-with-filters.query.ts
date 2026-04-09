'use server';

import { cache } from 'react';
import { getSupabaseServerClient } from '@/utils/supabase/server';
import { Book, Category } from '@/domain/entities/book.entity';
import { formatUserBook } from '@/lib/books/format-book';

export type BooksFilters = {
  category?: Category;
  search?: string;
  limit?: number;
  offset?: number;
};

function filterBooks(books: Book[], filters: BooksFilters): Book[] {
  let result = books;

  if (filters.category && filters.category !== 'All') {
    result = result.filter((book) => book.category === filters.category);
  }

  if (filters.search && filters.search.trim()) {
    const normalizedQuery = filters.search.toLowerCase().trim();
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery) ||
        book.category.toLowerCase().includes(normalizedQuery)
    );
  }

  return result;
}

export const getAllBooks = cache(async (): Promise<Book[]> => {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('unified_books')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url || undefined,
    coverColor: row.cover_color || '#8B4513',
    description: row.description || '',
    category: row.category as Book['category'],
    pages: row.page_count || 0,
    rating: Number(row.rating) || 0,
    ratingCount: Number(row.rating_count) || 0,
    reviewCount: Number(row.review_count) || 0,
    createdAt: new Date(row.created_at),
    userId: row.user_id || '',
    status: 'published',
  }));
});

export const getFilteredBooks = cache(async (filters: BooksFilters): Promise<Book[]> => {
  const allBooks = await getAllBooks();
  
  return filterBooks(allBooks, filters);
});
