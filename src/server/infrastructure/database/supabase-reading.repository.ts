import { IReadingRepository } from "@/server/domain/repositories/reading.repository";
import { ReadingProgress, SaveReadingProgressInput } from "@/server/domain/entities/reading-progress.entity";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export type ReadingProgressRow = {
  id: string;
  user_id: string;
  book_id: string;
  current_position: { scrollTop?: number; elementId?: string };
  progress_percent: number;
  started_at: string;
  finished_at: string | null;
};

function mapToReadingProgress(row: ReadingProgressRow): ReadingProgress {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    currentPosition: row.current_position,
    progressPercent: row.progress_percent,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

export class SupabaseReadingRepository implements IReadingRepository {
  async getByUserAndBook(userId: string, bookId: string): Promise<ReadingProgress | null> {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("book_reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching reading progress:", error);
      return null;
    }

    return data ? mapToReadingProgress(data) : null;
  }

  async save(input: SaveReadingProgressInput): Promise<ReadingProgress> {
    const supabase = await getSupabaseServerClient();
    const isCompleted = input.progressPercent >= 95;

    const { data, error } = await supabase
      .from("book_reading_progress")
      .upsert(
        {
          user_id: input.userId,
          book_id: input.bookId,
          current_position: input.currentPosition,
          progress_percent: Math.min(100, Math.max(0, input.progressPercent)),
          finished_at: isCompleted ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,book_id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error("Failed to save reading progress");
    }

    return mapToReadingProgress(data);
  }

  async getByUser(userId: string): Promise<ReadingProgress[]> {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("book_reading_progress")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching reading progress:", error);
      return [];
    }

    return (data || []).map(mapToReadingProgress);
  }
}