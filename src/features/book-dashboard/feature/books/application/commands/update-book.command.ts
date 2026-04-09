'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server';
import { UpdateUserBookInput } from '@/domain/entities/user-book.entity';
import { revalidatePath } from 'next/cache';

export async function updateBook(
  id: string,
  input: UpdateUserBookInput,
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

    const updateData: Record<string, unknown> = { ...input };

    Object.keys(updateData).forEach(
      (key) =>
        updateData[key] === undefined && delete updateData[key]
    );

    const { error } = await supabase
      .from('user_books')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) {
      return { success: false, error: 'Erro ao atualizar livro' };
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch {
    return { success: false, error: 'Erro interno' };
  }
}