"use server";

import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";
import { mapToBookEntity } from "@/server/infrastructure/mappers/book.mapper";
import { mapToBookFromUserBook } from "@/server/infrastructure/mappers/book.mapper";
import type { PublicBookListItem, PublicBooksFilters, PublicBooksResult } from "../types/public-books.types";
import type { BookCategory } from "@/server/domain/entities/book.entity";

const DEFAULT_LIMIT = 20;

/**
 * Get paginated public books from both 'books' (catalog) and 'user_books' (user-published)
 * This action is designed to be called without authentication
 */
export const getPublicBooksAction = cache(async (filters?: PublicBooksFilters): Promise<PublicBooksResult> => {
  const supabase = await getSupabaseAdmin();
  
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  const category = filters?.category;
  const search = filters?.search;

  // Fetch catalog books
  let catalogQuery = supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, category, rating", { count: "exact" });

  if (category) {
    catalogQuery = catalogQuery.eq("category", category);
  }

  if (search) {
    catalogQuery = catalogQuery.ilike("title", `%${search}%`);
  }

  const { data: catalogBooks, count: catalogCount, error: catalogError } = await catalogQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (catalogError) {
    console.error("Error fetching catalog books:", catalogError);
  }

  // Fetch user published books (no rating column in user_books, default to 0)
  let userBooksQuery = supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, created_at, published_at", { count: "exact" })
    .eq("status", "published");

  if (category) {
    userBooksQuery = userBooksQuery.eq("category", category);
  }

  if (search) {
    userBooksQuery = userBooksQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
  }

  const { data: userBooks, count: userBooksCount, error: userBooksError } = await userBooksQuery
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (userBooksError) {
    console.error("Error fetching user books:", userBooksError);
  }

  // Combine and format results
  const books: PublicBookListItem[] = [
    ...(catalogBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
    })),
    ...(userBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: 0, // user_books doesn't have rating column
    })),
  ];

  const total = (catalogCount || 0) + (userBooksCount || 0);
  const totalPages = Math.ceil(total / limit);

  return {
    books,
    total,
    page,
    totalPages,
  };
});

/**
 * Get a single public book by ID
 * Works for both catalog books and user-published books
 */
export const getPublicBookByIdAction = cache(async (id: string) => {
  const supabase = await getSupabaseAdmin();

  // Try to find in catalog books first
  const { data: catalogBook } = await supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
    .eq("id", id)
    .single();

  if (catalogBook) {
    return mapToBookEntity(catalogBook);
  }

  // Try to find in user books (no rating column)
  const { data: userBook } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, content, category, word_count, created_at, published_at")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (userBook) {
    return mapToBookFromUserBook(userBook);
  }

  return null;
});

/**
 * Get featured public books (top rated)
 */
export const getFeaturedPublicBooksAction = cache(async (limit: number = 10) => {
  const supabase = await getSupabaseAdmin();

  const { data: catalogBooks } = await supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, category, rating")
    .order("rating", { ascending: false })
    .limit(limit);

  // Fetch user books sorted by created_at (no rating column available)
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  const books: PublicBookListItem[] = [
    ...(catalogBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
    })),
    ...(userBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: 0, // user_books doesn't have rating column
    })),
  ];

  // Sort by rating and return top N (catalog books first due to rating)
  return books
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
});

/**
 * Search public books
 */
export const searchPublicBooksAction = cache(async (query: string) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const supabase = await getSupabaseAdmin();

  const { data: catalogBooks } = await supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, category, rating")
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(20);

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category")
    .eq("status", "published")
    .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
    .limit(20);

  const books: PublicBookListItem[] = [
    ...(catalogBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
    })),
    ...(userBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: 0,
    })),
  ];

  return books;
});