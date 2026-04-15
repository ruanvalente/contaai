"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseReadingRepository } from "@/server/infrastructure/database";

const readingRepository = new SupabaseReadingRepository();

export async function saveReadingProgress(
  bookId: string,
  progress: number,
  scrollPosition: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      userId = await getCurrentUserIdOptional();
    }

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const saveInput = {
      userId,
      bookId,
      currentPosition: { scrollTop: scrollPosition },
      progressPercent: Math.min(100, Math.max(0, progress)),
      finishedAt: progress >= 95 ? new Date() : undefined,
    };

    await readingRepository.save(saveInput);

    revalidatePath(`/book/${bookId}`);

    return { success: true };
  } catch (err) {
    console.error("Error in saveReadingProgress:", err);
    return { success: false, error: "Erro interno" };
  }
}
