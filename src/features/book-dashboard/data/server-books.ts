import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
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
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category: book.category as Book["category"],
    pages: book.pages || 0,
    rating: book.rating || 0,
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

export async function getBooks(filters?: BooksFilters): Promise<Book[]> {
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

export async function getCategories(): Promise<string[]> {
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
