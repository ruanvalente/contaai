'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { ReadingStatus } from '@/domain/entities/user-book.entity';
import { revalidatePath } from 'next/cache';

export async function markAsReading(
  bookId: string,
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
        reading_status: 'reading',
        reading_progress: 0,
      })
      .eq('id', bookId)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao marcar como lendo' };
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}

export async function markAsCompleted(
  bookId: string,
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
        reading_status: 'completed',
        reading_progress: 100,
      })
      .eq('id', bookId)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao marcar como concluído' };
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}

export async function updateReadingProgress(
  bookId: string,
  progress: number,
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

    let readingStatus: ReadingStatus = 'reading';
    if (progress >= 100) {
      readingStatus = 'completed';
    } else if (progress <= 0) {
      readingStatus = 'none';
    }

    const { error } = await supabase
      .from('user_books')
      .update({
        reading_progress: Math.min(100, Math.max(0, progress)),
        reading_status: readingStatus,
      })
      .eq('id', bookId)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao atualizar progresso' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}