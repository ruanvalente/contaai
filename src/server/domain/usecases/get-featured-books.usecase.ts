import { Book } from "../entities/book.entity";
import { IBookRepository } from "../repositories/book.repository";

export class GetFeaturedBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(): Promise<Book[]> {
    return this.bookRepository.getFeatured();
  }
}