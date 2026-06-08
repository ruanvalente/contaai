"use server";

import { cache } from "react";
import { SupabasePublicBookRepository } from "@/server/infrastructure/database/supabase-public-book.repository";
import type {
  PublicBookListItem,
  PublicBooksFilters,
  PublicBooksResult,
} from "../types/public-books.types";

const publicBookRepository = new SupabasePublicBookRepository();

export const getPublicBooksAction = cache(
  async (filters?: PublicBooksFilters): Promise<PublicBooksResult> => {
    return publicBookRepository.getPublicBooks(filters || {});
  },
);

export const getPublicBookByIdAction = cache(async (id: string) => {
  return publicBookRepository.getPublicBookById(id);
});

export const getFeaturedPublicBooksAction = cache(
  async (limit: number = 10) => {
    return publicBookRepository.getFeaturedPublicBooks(limit);
  },
);

export const searchPublicBooksAction = cache(async (query: string) => {
  return publicBookRepository.searchPublicBooks(query);
});
