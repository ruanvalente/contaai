'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Book } from '@/domain/entities/book.entity';
import { formatUserBook } from '@/lib/books/format-book';

export type BooksFilters = {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

type UnifiedBookRow = {
  source: 'catalog' | 'user';
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  page_count: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
};

export const getBooks = cache(async (filters?: BooksFilters): Promise<Book[]> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('unified_books')
    .select('source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at, user_id, status')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return (data || []).map((book: UnifiedBookRow) => {
    if (book.source === 'catalog') {
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url || undefined,
        coverColor: book.cover_color || '#8B4513',
        description: book.description || '',
        category: book.category as Book['category'],
        pages: book.page_count || 0,
        rating: typeof book.rating === 'string' ? parseFloat(book.rating) : (book.rating || 0),
        ratingCount: book.rating_count || 0,
        reviewCount: book.review_count || 0,
        createdAt: new Date(book.created_at),
      };
    }
    return formatUserBook({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      cover_color: book.cover_color,
      category: book.category,
      word_count: (book.page_count || 0) * 500,
      created_at: book.created_at,
    });
  });
});

export const getBooksCached = cache(async (): Promise<Book[]> => {
  return getBooks();
});

export type BooksResponse = {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
};

export const getBooksPaginated = cache(async (
  page: number = 1,
  limit: number = 10,
  category?: string,
  search?: string
): Promise<BooksResponse> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const offset = (page - 1) * limit;

  let query = supabase
    .from('unified_books')
    .select('source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (search) {
    const searchTerm = search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching books:', error);
    return { books: [], total: 0, page, totalPages: 0 };
  }

  const books = (data || []).map((book: UnifiedBookRow) => {
    if (book.source === 'catalog') {
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url || undefined,
        coverColor: book.cover_color || '#8B4513',
        description: book.description || '',
        category: book.category as Book['category'],
        pages: book.page_count || 0,
        rating: typeof book.rating === 'string' ? parseFloat(book.rating) : (book.rating || 0),
        ratingCount: book.rating_count || 0,
        reviewCount: book.review_count || 0,
        createdAt: new Date(book.created_at),
      };
    }
    return formatUserBook({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      cover_color: book.cover_color,
      category: book.category,
      word_count: (book.page_count || 0) * 500,
      created_at: book.created_at,
    });
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { books, total, page, totalPages };
});