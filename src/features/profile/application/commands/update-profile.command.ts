'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  avatar_url: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
  profile?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  };
};

export async function updateProfile(data: UpdateProfileInput): Promise<UpdateProfileResult> {
  try {
    const validated = updateProfileSchema.parse(data);
    
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const updates: Record<string, string | null> = {};

    if (validated.name !== undefined) {
      updates.name = validated.name || null;
    }

    if (validated.bio !== undefined) {
      updates.bio = validated.bio || null;
    }

    if (validated.avatar_url !== undefined) {
      updates.avatar_url = validated.avatar_url || null;
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Erro ao atualizar perfil.' };
    }

    revalidatePath('/settings');
    revalidatePath('/profile');

    return {
      success: true,
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: user.email || '',
        avatar_url: updatedProfile.avatar_url,
        bio: updatedProfile.bio,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at,
      },
    };
  } catch (err) {
    console.error('Error in updateProfile:', err);
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: 'Erro interno ao atualizar perfil.' };
  }
}