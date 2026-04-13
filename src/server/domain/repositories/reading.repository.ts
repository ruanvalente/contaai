import { ReadingProgress, SaveReadingProgressInput } from "../entities/reading-progress.entity";

export interface IReadingRepository {
  getByUserAndBook(userId: string, bookId: string): Promise<ReadingProgress | null>;
  save(input: SaveReadingProgressInput): Promise<ReadingProgress>;
  getByUser(userId: string): Promise<ReadingProgress[]>;
}