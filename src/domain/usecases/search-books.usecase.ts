import { Book } from "../entities/book.entity";
import { IBookRepository } from "../repositories/book.repository";

export class SearchBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(query: string): Promise<Book[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.bookRepository.search(query);
  }
}