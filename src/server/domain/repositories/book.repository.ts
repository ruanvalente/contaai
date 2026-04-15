import { Book, BookCategory } from "../entities/book.entity";

export interface IBookRepository {
  getAll(category?: BookCategory, search?: string): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
  getFeatured(): Promise<Book[]>;
  search(query: string): Promise<Book[]>;
}