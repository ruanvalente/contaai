'use server'

import { cache } from "react";
import { GetBooksUseCase } from "@/server/domain/usecases/get-books.usecase";
import { SupabaseBookRepository } from "@/server/infrastructure/database/supabase-book.repository";
import { SupabaseUserBookRepository } from "@/server/infrastructure/database/supabase-user-book.repository";
import { Book, BookCategory } from "@/server/domain/entities/book.entity";

const bookRepository = new SupabaseBookRepository();
const userBookRepository = new SupabaseUserBookRepository();
const getBooksUseCase = new GetBooksUseCase(bookRepository);

export const getBooksAction = cache(async (options?: {
  category?: BookCategory;
  search?: string;
}): Promise<Book[]> => {
  const books = await getBooksUseCase.execute(options || {});

  const userBooks = await userBookRepository.getPublishedBooks();
  const formattedUserBooks = userBooks.map((ub) => ({
    id: ub.id,
    title: ub.title,
    author: ub.author,
    coverUrl: ub.coverUrl,
    coverColor: ub.coverColor,
    description: "",
    category: ub.category,
    pages: Math.ceil((ub.wordCount || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: ub.createdAt,
  }));

  return [...books, ...formattedUserBooks];
});

export const getBookByIdAction = cache(async (id: string): Promise<Book | null> => {
  return bookRepository.getById(id);
});

export const getFeaturedBooksAction = cache(async (): Promise<Book[]> => {
  return bookRepository.getFeatured();
});

export const searchBooksAction = cache(async (query: string): Promise<Book[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  return bookRepository.search(query);
});
