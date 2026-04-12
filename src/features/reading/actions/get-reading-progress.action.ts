"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";
import { ReadingProgress } from "@/domain/entities/reading-progress.entity";

export async function getReadingProgress(
  bookId: string,
  userId: string
): Promise<ReadingProgress | null> {
    try {
      const supabase = await getSupabaseServerClient();

      const { data, error } = await supabase
        .from("book_reading_progress")
        .select("*")
        .eq("book_id", bookId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: "",
        userId: "",
        bookId: data.book_id,
        progressPercent: data.progress_percent,
        currentPosition: {
          scrollTop: data.current_position?.scrollTop ?? 0,
          elementId: data.current_position?.elementId,
        },
        startedAt: data.started_at,
        finishedAt: data.finished_at || null,
      };
    } catch (err) {
      console.error("Error fetching reading progress:", err);
      return null;
    }
  }
