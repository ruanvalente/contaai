import { mapToBookEntity, mapToBookFromUserBook, SupabaseBook, UserBookRow } from "@/server/infrastructure/mappers/book.mapper";
import { Book } from "@/server/domain/entities/book.entity";

export type { SupabaseBook, UserBookRow };

export function formatBook(book: SupabaseBook): Book {
  return mapToBookEntity(book);
}

export function formatUserBook(book: UserBookRow): Book {
  return mapToBookFromUserBook(book);
}