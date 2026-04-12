import { SaveReadingProgressInput, ReadingProgress } from "../entities/reading-progress.entity";
import { IReadingRepository } from "../repositories/reading.repository";

export class SaveReadingProgressUseCase {
  constructor(private readingRepository: IReadingRepository) {}

  async execute(input: SaveReadingProgressInput): Promise<ReadingProgress> {
    return this.readingRepository.save(input);
  }
}