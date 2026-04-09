'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { UserBook } from '@/domain/entities/user-book.entity';
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

export async function publishBook(
  id: string,
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

    const { error } = await supabase
      .from('user_books')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao publicar livro' };
    }

    const { data: book } = await supabase
      .from('user_books')
      .select('*')
      .eq('id', id)
      .eq('user_id', currentUserId)
      .single();

    revalidatePath('/dashboard/library');
    revalidatePath(`/book/${id}`);
    return { success: true, book: book ? formatUserBook(book) : undefined };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}

export async function unpublishBook(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;

    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { error } = await supabase
      .from('user_books')
      .update({
        status: 'draft',
        published_at: null,
      })
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao desatualizar livro' };
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}