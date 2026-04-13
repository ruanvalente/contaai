"use server";

import { SupabaseStorageRepository } from "@/server/infrastructure/storage/supabase-storage.repository";

const storageRepository = new SupabaseStorageRepository();

export async function uploadBookCover(
  file: File,
  bookId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  return storageRepository.uploadBookCover(file, bookId);
}

export async function deleteBookCover(
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  return storageRepository.deleteBookCover(bookId);
}
