import type { Book } from "@/features/book-dashboard/types/book.types";

export type SupabaseBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  pages: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
};

export type UserBookRow = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  category: string;
  word_count: number | null;
  created_at: string;
};

const VALID_CATEGORIES: Book["category"][] = [
  "Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"
];

export function formatBook(book: SupabaseBook): Book {
  const category = VALID_CATEGORIES.includes(book.category as Book["category"]) 
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
    rating: typeof book.rating === "string" 
      ? parseFloat(book.rating) 
      : (book.rating || 0),
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

export function formatUserBook(book: UserBookRow): Book {
  return {
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
  };
}
