"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveReadingProgress(
  bookId: string,
  progress: number,
  scrollPosition: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      const supabase = await getSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }
      
      userId = user.id;
    }

    const supabase = await getSupabaseServerClient();

    const isCompleted = progress >= 95;

    const { error } = await supabase
      .from("book_reading_progress")
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          current_position: { scrollTop: scrollPosition },
          progress_percent: Math.min(100, Math.max(0, progress)),
          finished_at: isCompleted ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,book_id",
        }
      );

    if (error) {
      console.error("Error saving reading progress:", error);
      return { success: false, error: "Erro ao salvar progresso" };
    }

    revalidatePath(`/book/${bookId}`);

    return { success: true };
  } catch (err) {
    console.error("Error in saveReadingProgress:", err);
    return { success: false, error: "Erro interno" };
  }
}
