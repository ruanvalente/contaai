"use server";

import { SupabaseStorageRepository } from "@/server/infrastructure/storage/supabase-storage.repository";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";

const storageRepository = new SupabaseStorageRepository();

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const result = await storageRepository.uploadAvatar(userId, file);

    if (!result.success) {
      return failure("UPLOAD_FAILED", result.error || "Erro ao fazer upload");
    }

    return success({ url: result.url! });
  } catch (err) {
    console.error("Error in uploadAvatar:", err);
    return failure("UPLOAD_ERROR", "Erro interno ao fazer upload.");
  }
}
