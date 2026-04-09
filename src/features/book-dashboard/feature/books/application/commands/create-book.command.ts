'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { CreateUserBookInput, UserBook } from '@/domain/entities/user-book.entity';
import { generateRandomCoverColor } from '@/features/book-dashboard/utils/book-config';
import { revalidatePath } from 'next/cache';

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
    status: book.status as UserBook['status'],
    readingStatus: book.reading_status as UserBook['readingStatus'],
    readingProgress: book.reading_progress,
    category: book.category as UserBook['category'],
    wordCount: book.word_count,
    createdAt: new Date(book.created_at),
    updatedAt: new Date(book.updated_at),
    publishedAt: book.published_at ? new Date(book.published_at) : undefined,
  };
}

export async function createBook(
  input: CreateUserBookInput,
  userId?: string
): Promise<{ success: boolean; book?: UserBook; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;

    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('user_books')
      .insert({
        user_id: currentUserId,
        title: input.title,
        author: input.author,
        cover_url: input.coverUrl,
        cover_color: input.coverColor || generateRandomCoverColor(),
        category: input.category,
        status: 'draft',
        reading_status: 'none',
        reading_progress: 0,
        word_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating book:', error);
      return { success: false, error: 'Erro ao criar livro' };
    }

    revalidatePath('/dashboard/library');

    return { success: true, book: formatUserBook(data) };
  } catch (err) {
    console.error('Error in createBook:', err);
    return { success: false, error: 'Erro interno' };
  }
}