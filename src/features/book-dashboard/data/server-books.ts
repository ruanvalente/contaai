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
  const books = await fetchBooksFromSupabase(filters);
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, status, word_count, created_at")
    .eq("status", "published");
  
  const publishedUserBooks: Book[] = (userBooks || []).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: "",
    category: book.category as Book["category"],
    pages: Math.ceil((book.word_count || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: new Date(book.created_at),
  }));
  
  const allBooks = [...books, ...publishedUserBooks];
  
  if (filters?.category && filters.category !== "All") {
    return allBooks.filter((book) => book.category === filters.category);
  }
  
  return allBooks;
});

export const getBooksCached = cache(async (): Promise<Book[]> => {
  return fetchBooksFromSupabase();
});

export async function getUserBookById(id: string): Promise<{
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  content?: string;
  category: string;
  wordCount: number;
  createdAt: Date;
  publishedAt?: Date;
} | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, content, category, word_count, created_at, published_at")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching user book:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverUrl: data.cover_url || undefined,
    coverColor: data.cover_color || "#8B4513",
    content: data.content || undefined,
    category: data.category,
    wordCount: data.word_count || 0,
    createdAt: new Date(data.created_at),
    publishedAt: data.published_at ? new Date(data.published_at) : undefined,
  };
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

async function fetchCategoriesFromSupabase(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [booksResult, userBooksResult] = await Promise.all([
    supabase.from("books").select("category"),
    supabase.from("user_books").select("category").eq("status", "published")
  ]);

  const allCategories = [
    ...(booksResult.data || []).map((item) => item.category),
    ...(userBooksResult.data || []).map((item) => item.category)
  ];

  return [...new Set(allCategories)];
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

  let booksQuery = supabase
    .from("books")
    .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  let userBooksQuery = supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, status, word_count, created_at")
    .eq("status", "published");

  if (category && category !== "All") {
    booksQuery = booksQuery.eq("category", category);
    userBooksQuery = userBooksQuery.eq("category", category);
  }

  if (search) {
    const searchTerm = search.trim();
    booksQuery = booksQuery.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`);
    userBooksQuery = userBooksQuery.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`);
  }

  const [booksData, userBooksData] = await Promise.all([
    booksQuery,
    userBooksQuery
  ]);

  const publishedUserBooks: Book[] = (userBooksData.data || []).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: "",
    category: book.category as Book["category"],
    pages: Math.ceil((book.word_count || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: new Date(book.created_at),
  }));

  const allBooks = [
    ...(booksData.data || []).map(formatBook),
    ...publishedUserBooks
  ];

  const total = (booksData.count || 0) + (userBooksData.data?.length || 0);
  const totalPages = Math.ceil(total / limit);

  const startIndex = offset;
  const endIndex = offset + limit;
  const paginatedBooks = allBooks.slice(startIndex, endIndex);

  return {
    books: paginatedBooks,
    total,
    page,
    totalPages,
  };
});