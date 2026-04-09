'use server';

import { cache } from 'react';
import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';

export type Favorite = {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  bookCoverColor?: string;
  createdAt: Date;
};

export const getUserFavorites = cache(async (): Promise<Favorite[]> => {
  const userId = await getCurrentUserIdOptional();
  
  if (!userId) {
    return [];
  }

  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    bookCoverUrl: row.book_cover_url || undefined,
    bookCoverColor: row.book_cover_color || undefined,
    createdAt: new Date(row.created_at),
  }));
});
