import { Book, BookCategory } from "../entities/book.entity";
import { IBookRepository } from "../repositories/book.repository";

export interface GetBooksOptions {
  category?: BookCategory;
  search?: string;
  page?: number;
}

export class GetBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(options: GetBooksOptions = {}): Promise<Book[]> {
    const { category, search } = options;
    return this.bookRepository.getAll(category, search);
  }
}