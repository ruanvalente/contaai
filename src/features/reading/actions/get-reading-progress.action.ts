"use server";

import { cache } from "react";
import { ReadingProgress } from "@/server/domain/entities/reading-progress.entity";
import { SupabaseReadingRepository } from "@/server/infrastructure/database";

const readingRepository = new SupabaseReadingRepository();

export const getReadingProgress = cache(async (
  bookId: string,
  userId: string
): Promise<ReadingProgress | null> => {
  try {
    return readingRepository.getByUserAndBook(userId, bookId);
  } catch (err) {
    console.error("Error fetching reading progress:", err);
    return null;
  }
});
