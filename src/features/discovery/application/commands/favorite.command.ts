'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserId } from '@/utils/auth/get-current-user.server';
import { revalidatePath } from 'next/cache';

export type FavoriteInput = {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  bookCoverColor?: string;
};

export async function addFavorite(input: FavoriteInput): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        book_id: input.bookId,
        book_title: input.bookTitle,
        book_author: input.bookAuthor,
        book_cover_url: input.bookCoverUrl || null,
        book_cover_color: input.bookCoverColor || null,
      });

    if (error) {
      console.error('Error adding favorite:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/favorites');
    revalidatePath('/dashboard/favorites');

    return { success: true };
  } catch (error) {
    console.error('Error in addFavorite:', error);
    return { success: false, error: 'Failed to add favorite' };
  }
}

export async function removeFavorite(bookId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      console.error('Error removing favorite:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/favorites');
    revalidatePath('/dashboard/favorites');

    return { success: true };
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    return { success: false, error: 'Failed to remove favorite' };
  }
}

export async function toggleFavorite(input: FavoriteInput): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, isFavorite: false, error: 'User not authenticated' };
    }

    const supabase = await getSupabaseServerClient();

    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', input.bookId)
      .single();

    if (existing) {
      const result = await removeFavorite(input.bookId);
      return { success: result.success, isFavorite: false, error: result.error };
    } else {
      const result = await addFavorite(input);
      return { success: result.success, isFavorite: true, error: result.error };
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    return { success: false, isFavorite: false, error: 'Failed to toggle favorite' };
  }
}