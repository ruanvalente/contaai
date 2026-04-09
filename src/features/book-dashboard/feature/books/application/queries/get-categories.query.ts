'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

async function fetchCategoriesFromSupabase(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: catalogCategories } = await supabase.from('books').select('category');
  const { data: userCategories } = await supabase.from('user_books').select('category').eq('status', 'published');

  const allCategories = [
    ...(catalogCategories || []).map((item) => item.category),
    ...(userCategories || []).map((item) => item.category),
  ];

  return [...new Set(allCategories)];
}

export const getCategories = cache(async (): Promise<string[]> => {
  return fetchCategoriesFromSupabase();
});

export const getUserBookById = cache(async (id: string): Promise<{
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  content?: string;
  category: string;
  wordCount: number;
  createdAt: Date;
  publishedAt?: Date;
} | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('user_books')
    .select('id, title, author, cover_url, cover_color, content, category, word_count, created_at, published_at')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching user book:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverUrl: data.cover_url || undefined,
    coverColor: data.cover_color || '#8B4513',
    content: data.content || undefined,
    category: data.category,
    wordCount: data.word_count || 0,
    createdAt: new Date(data.created_at),
    publishedAt: data.published_at ? new Date(data.published_at) : undefined,
  };
});

export const getBookById = cache(async (id: string): Promise<{
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  description: string;
  category: string;
  pages: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
} | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('books')
    .select('id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverUrl: data.cover_url || undefined,
    coverColor: data.cover_color || '#8B4513',
    description: data.description || '',
    category: data.category,
    pages: data.pages || 0,
    rating: typeof data.rating === 'string' ? parseFloat(data.rating) : (data.rating || 0),
    ratingCount: data.rating_count || 0,
    reviewCount: data.review_count || 0,
    createdAt: new Date(data.created_at),
  };
});