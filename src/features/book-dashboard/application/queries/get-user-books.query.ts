'use server';

import { cache } from 'react';
import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserId } from '@/utils/auth/get-current-user.server';
import { UserBook, UserBookStatus, ReadingStatus } from '@/domain/entities/user-book.entity';

type SupabaseUserBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  content: string | null;
  content_url: string | null;
  status: string;
  reading_status: string;
  reading_progress: number;
  category: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

function formatUserBook(book: SupabaseUserBook): UserBook {
  return {
    id: book.id,
    userId: book.user_id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || '#8B4513',
    content: book.content || undefined,
    contentUrl: book.content_url || undefined,
    status: book.status as UserBookStatus,
    readingStatus: book.reading_status as ReadingStatus,
    readingProgress: book.reading_progress,
    category: book.category as UserBook['category'],
    wordCount: book.word_count,
    createdAt: new Date(book.created_at),
    updatedAt: new Date(book.updated_at),
    publishedAt: book.published_at ? new Date(book.published_at) : undefined,
  };
}

export const getUserBooks = cache(
  async (userId: string, status?: UserBookStatus): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    let query = supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user books:', error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getUserReadingBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .eq('reading_status', 'reading')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching reading books:', error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getUserCompletedBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .eq('reading_status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed books:', error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getPublishedBooks = cache(
  async (): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching published books:', error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getBookById = cache(
  async (id: string): Promise<UserBook | null> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching book:', error);
      return null;
    }

    return formatUserBook(data);
  }
);

export const getCurrentUserBooks = cache(async (): Promise<{
  myStories: UserBook[];
  reading: UserBook[];
  completed: UserBook[];
}> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { myStories: [], reading: [], completed: [] };
  }

  const [myStories, reading, completed] = await Promise.all([
    getUserBooks(userId, 'draft'),
    getUserReadingBooks(userId),
    getUserCompletedBooks(userId),
  ]);

  return { myStories, reading, completed };
});