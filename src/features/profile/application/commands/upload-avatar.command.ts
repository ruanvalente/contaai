'use server';

import { getSupabaseServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return extensions[mimeType] || 'jpg';
}

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<UploadResult> {
  try {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'Arquivo muito grande. O tamanho máximo é 2MB.',
      };
    }

    const supabase = await getSupabaseServerClient();
    const extension = getFileExtension(file.type);
    const fileName = `avatar.${extension}`;
    const filePath = `${userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('contaai')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: 'Erro ao fazer upload da imagem.',
      };
    }

    const { data: urlData } = supabase.storage
      .from('contaai')
      .getPublicUrl(filePath);

    revalidatePath('/settings');

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (err) {
    console.error('Error in uploadAvatar:', err);
    return {
      success: false,
      error: 'Erro interno ao fazer upload.',
    };
  }
}

export async function deleteAvatar(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    const extensions = ['jpg', 'png', 'webp'];

    for (const ext of extensions) {
      const filePath = `${userId}/avatar.${ext}`;
      await supabase.storage.from('contaai').remove([filePath]);
    }

    revalidatePath('/settings');

    return { success: true };
  } catch (err) {
    console.error('Error in deleteAvatar:', err);
    return { success: false, error: 'Erro ao deletar avatar.' };
  }
}
