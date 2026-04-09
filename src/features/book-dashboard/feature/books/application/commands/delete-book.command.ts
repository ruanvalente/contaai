'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { revalidatePath } from 'next/cache';

export async function deleteBook(
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
      .delete()
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao excluir livro' };
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}