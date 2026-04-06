"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";
import { ReadingProgress } from "@/features/reading/types/reading.types";

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
        bookId: data.book_id,
        progressPercent: data.progress_percent,
        scrollTop: data.current_position?.scrollTop ?? 0,
        elementId: data.current_position?.elementId,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
      };
    } catch (err) {
      console.error("Error fetching reading progress:", err);
      return null;
    }
  }
