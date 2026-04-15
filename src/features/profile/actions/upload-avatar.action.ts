"use server";

import { SupabaseStorageRepository } from "@/server/infrastructure/storage/supabase-storage.repository";

type UploadResult = 
  | { success: true; url: string }
  | { success: false; error: string };

const storageRepository = new SupabaseStorageRepository();

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<UploadResult> {
  try {
    const result = await storageRepository.uploadAvatar(userId, file);

    if (!result.success) {
      return { success: false, error: result.error || "Erro ao fazer upload" };
    }

    return { success: true, url: result.url! };
  } catch (err) {
    console.error("Error in uploadAvatar:", err);
    return { success: false, error: "Erro interno ao fazer upload." };
  }
}
