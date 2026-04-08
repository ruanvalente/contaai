'use server'

import { GetBooksUseCase } from "@/domain/usecases/get-books.usecase";
import { SupabaseBookRepository } from "@/infrastructure/database/supabase-book.repository";
import { Book, BookCategory } from "@/domain/entities/book.entity";
import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";
import { mapToBookFromUserBook } from "@/infrastructure/mappers/book.mapper";

const bookRepository = new SupabaseBookRepository();
const getBooksUseCase = new GetBooksUseCase(bookRepository);

export async function getBooksAction(options?: {
  category?: BookCategory;
  search?: string;
}): Promise<Book[]> {
  const books = await getBooksUseCase.execute(options || {});
  
  const supabase = await getSupabaseAdmin();
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id, title, author, cover_url, cover_color, category, word_count, created_at, published_at")
    .eq("status", "published");

  const formattedUserBooks = (userBooks || []).map(mapToBookFromUserBook);
  
  return [...books, ...formattedUserBooks];
}

export async function getBookByIdAction(id: string): Promise<Book | null> {
  return bookRepository.getById(id);
}

export async function getFeaturedBooksAction(): Promise<Book[]> {
  return bookRepository.getFeatured();
}

export async function searchBooksAction(query: string): Promise<Book[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  return bookRepository.search(query);
}