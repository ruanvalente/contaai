import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { Book } from "@/features/book-dashboard/types/book.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

type UserBookRow = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  category: string;
  word_count: number;
  created_at: string;
  published_at: string | null;
};

function formatUserBookToBook(book: UserBookRow): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: "",
    category: book.category as Book["category"],
    pages: Math.ceil(book.word_count / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: new Date(book.created_at),
  };
}

export async function getCachedBooks(): Promise<Book[]> {
  "use cache";
  cacheTag("books", "books-list");
  cacheLife("hours");

  if (!supabaseAdmin) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured, returning empty array");
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, word_count, created_at, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching cached books:", error);
    return [];
  }

  return (data || []).map(formatUserBookToBook);
}

export async function getCachedBookById(id: string): Promise<Book | null> {
  "use cache";
  cacheTag("books", `book-${id}`);
  cacheLife("days");

  if (!supabaseAdmin) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured, returning null");
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, word_count, created_at, published_at")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching cached book:", error);
    return null;
  }

  return formatUserBookToBook(data);
}

export async function getCachedCategories(): Promise<string[]> {
  "use cache";
  cacheTag("books", "categories");
  cacheLife("hours");

  if (!supabaseAdmin) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured, returning empty array");
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("user_books")
    .select("category")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching cached categories:", error);
    return [];
  }

  return [...new Set(data.map((item) => item.category))];
}

export async function getCachedBooksByCategory(category: string): Promise<Book[]> {
  "use cache";
  cacheTag("books", `books-category-${category}`);
  cacheLife("hours");

  if (!supabaseAdmin) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured, returning empty array");
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, word_count, created_at, published_at")
    .eq("category", category)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching cached books by category:", error);
    return [];
  }

  return (data || []).map(formatUserBookToBook);
}

export async function searchCachedBooks(query: string): Promise<Book[]> {
  "use cache";
  cacheTag("books", `books-search-${query}`);
  cacheLife("minutes");

  if (!supabaseAdmin) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured, returning empty array");
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, word_count, created_at, published_at")
    .eq("status", "published")
    .or(`title.ilike.*${query}*,author.ilike.*${query}*,category.ilike.*${query}*`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error searching cached books:", error);
    return [];
  }

  return (data || []).map(formatUserBookToBook);
}
