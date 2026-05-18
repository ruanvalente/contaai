"use server";

import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";
import { mapToBookEntity } from "@/server/infrastructure/mappers/book.mapper";
import { mapToBookFromUserBook } from "@/server/infrastructure/mappers/book.mapper";
import type {
  PublicBookListItem,
  PublicBooksFilters,
  PublicBooksResult,
} from "../types/public-books.types";
import type { BookCategory } from "@/server/domain/entities/book.entity";

const DEFAULT_LIMIT = 20;

/**
 * Get paginated public books from unified_books view
 * This action is designed to be called without authentication
 */
export const getPublicBooksAction = cache(
  async (filters?: PublicBooksFilters): Promise<PublicBooksResult> => {
    const supabase = await getSupabaseAdmin();

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const category = filters?.category;
    const search = filters?.search;

    // Fetch from unified_books view (books + user_books with ratings)
    let query = supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, category, rating, rating_count, page_count",
        { count: "exact" },
      );

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching public books:", error);
    }

    const books: PublicBookListItem[] = (data || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
      pages: book.page_count || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: 0,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      books,
      total,
      page,
      totalPages,
    };
  },
);

/**
 * Get a single public book by ID from unified_books view
 */
export const getPublicBookByIdAction = cache(async (id: string) => {
  const supabase = await getSupabaseAdmin();

  const { data: book } = await supabase
    .from("unified_books")
    .select(
      "id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at, source",
    )
    .eq("id", id)
    .single();

  if (!book) return null;

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category: book.category as BookCategory,
    pages: book.pages || 0,
    rating: book.rating || 0,
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
});

/**
 * Get featured public books (top rated) from unified_books view
 */
export const getFeaturedPublicBooksAction = cache(
  async (limit: number = 10) => {
    const supabase = await getSupabaseAdmin();

    const { data } = await supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, category, rating, page_count, rating_count",
      )
      .order("rating", { ascending: false })
      .limit(limit);

    return (data || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
      pages: book.page_count || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: 0,
    }));
  },
);

/**
 * Search public books from unified_books view
 */
export const searchPublicBooksAction = cache(async (query: string) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const supabase = await getSupabaseAdmin();

  const { data } = await supabase
    .from("unified_books")
    .select(
      "id, title, author, cover_url, cover_color, category, rating, rating_count, page_count",
    )
    .or(
      `title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`,
    )
    .limit(20);

  return (data || []).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    category: book.category as BookCategory,
    rating: book.rating || 0,
    pages: book.page_count || 0,
    ratingCount: book.rating_count || 0,
    reviewCount: 0,
  }));
});
