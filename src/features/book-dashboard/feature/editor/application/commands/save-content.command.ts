'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { revalidatePath } from 'next/cache';

export async function saveContent(
  id: string,
  content: string,
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

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const { error } = await supabase
      .from('user_books')
      .update({
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao salvar conteúdo' };
    }

    revalidatePath(`/book/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}