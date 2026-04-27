import { Book, BookCategory } from "@/server/domain/entities/book.entity";

/**
 * Public Books Feature
 * 
 * Provides public access to published books for anonymous users.
 * Allows viewing book lists and reading content without authentication.
 */

export type { Book, BookCategory };

export interface PublicBookListItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  category: BookCategory;
  rating: number;
}

export interface PublicBookDetail extends PublicBookListItem {
  description: string;
  pages: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
  wordCount?: number;
  publishedAt?: Date;
}

export interface PublicBooksFilters {
  category?: BookCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PublicBooksResult {
  books: PublicBookListItem[];
  total: number;
  page: number;
  totalPages: number;
}