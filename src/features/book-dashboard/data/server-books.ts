import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";

export type BooksFilters = {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

type SupabaseBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  pages: number | null;
  rating: number | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
}

function formatBook(book: SupabaseBook): Book {
  const validCategories: Book["category"][] = ["Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"];
  const category = validCategories.includes(book.category as Book["category"]) 
    ? book.category as Book["category"] 
    : "Drama" as Book["category"];

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category,
    pages: book.pages || 0,
    rating: book.rating || 0,
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

async function fetchBooksFromSupabase(filters?: BooksFilters): Promise<Book[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
    .order("created_at", { ascending: false });

  if (filters?.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.limit || 20) + (filters.offset || 0) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching books:", error);
    return [];
  }

  return (data || []).map(formatBook);
}

export const getBooks = cache(async (filters?: BooksFilters): Promise<Book[]> => {
  return fetchBooksFromSupabase(filters);
});

export const getBooksCached = cache(async (): Promise<Book[]> => {
  return fetchBooksFromSupabase();
});

export async function getBookById(id: string): Promise<Book | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching book:", error);
    return null;
  }

  return formatBook(data);
}

async function fetchCategoriesFromSupabase(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("books")
    .select("category", { count: "exact", head: false });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return [...new Set(data.map((item) => item.category))];
}

export const getCategories = cache(async (): Promise<string[]> => {
  return fetchCategoriesFromSupabase();
});

export type BooksResponse = {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
};

export const getBooksPaginated = cache(async (
  page: number = 1, 
  limit: number = 10,
  category?: string,
  search?: string
): Promise<BooksResponse> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const offset = (page - 1) * limit;

  let query = supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (search) {
    const searchTerm = search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`);
  }

  const [data, countResult] = await Promise.all([
    query,
    (async () => {
      let countQuery = supabase.from("books").select("*", { count: "exact", head: true });
      
      if (category && category !== "All") {
        countQuery = countQuery.eq("category", category);
      }

      if (search) {
        const searchTerm = search.trim();
        countQuery = countQuery.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`);
      }

      return countQuery;
    })()
  ]);

  if (data.error) {
    console.error("Error fetching books:", data.error);
    return { books: [], total: 0, page, totalPages: 0 };
  }

  const total = countResult.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    books: (data.data || []).map(formatBook),
    total,
    page,
    totalPages,
  };
});