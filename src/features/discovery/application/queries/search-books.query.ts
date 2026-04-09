'use server';

import { cache } from 'react';
import { getSupabaseServerClient } from '@/utils/supabase/server';
import { Book } from '@/domain/entities/book.entity';
import { formatUserBook } from '@/lib/books/format-book';

export type SearchFilters = {
  query?: string;
  category?: string;
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
  user_id: string | null;
  status: string | null;
};

export const searchBooks = cache(async (filters: SearchFilters): Promise<Book[]> => {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('unified_books')
    .select('source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at, user_id, status')
    .order('created_at', { ascending: false });

  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters.query) {
    const searchTerm = filters.query.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching books:', error);
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
        rating: Number(book.rating) || 0,
        ratingCount: Number(book.rating_count) || 0,
        reviewCount: Number(book.review_count) || 0,
        createdAt: new Date(book.created_at),
        userId: book.user_id || '',
        status: 'published',
      };
    }
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || '#8B4513',
      description: book.description || '',
      category: book.category as Book['category'],
      pages: book.page_count || 0,
      rating: Number(book.rating) || 0,
      ratingCount: Number(book.rating_count) || 0,
      reviewCount: Number(book.review_count) || 0,
      createdAt: new Date(book.created_at),
      userId: book.user_id || '',
      status: 'published' as const,
      content: undefined,
      contentUrl: undefined,
      readingStatus: 'none' as const,
      readingProgress: 0,
      wordCount: 0,
      updatedAt: new Date(book.created_at),
    };
  });
});

export const getBooksByCategory = cache(async (category: string): Promise<Book[]> => {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('unified_books')
    .select('source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at, user_id, status')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books by category:', error);
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
        rating: Number(book.rating) || 0,
        ratingCount: Number(book.rating_count) || 0,
        reviewCount: Number(book.review_count) || 0,
        createdAt: new Date(book.created_at),
        userId: book.user_id || '',
        status: 'published',
      };
    }
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || '#8B4513',
      description: book.description || '',
      category: book.category as Book['category'],
      pages: book.page_count || 0,
      rating: Number(book.rating) || 0,
      ratingCount: Number(book.rating_count) || 0,
      reviewCount: Number(book.review_count) || 0,
      createdAt: new Date(book.created_at),
      userId: book.user_id || '',
      status: 'published' as const,
      content: undefined,
      contentUrl: undefined,
      readingStatus: 'none' as const,
      readingProgress: 0,
      wordCount: 0,
      updatedAt: new Date(book.created_at),
    };
  });
});