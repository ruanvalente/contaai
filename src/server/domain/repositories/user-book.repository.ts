import { UserBook, UserBookStatus, ReadingStatus } from "../entities/user-book.entity";

export type UserBookFilter = "my-stories" | "reading" | "completed";

export interface IUserBookRepository {
  getByUserId(userId: string, filter: UserBookFilter): Promise<UserBook[]>;
  getById(id: string): Promise<UserBook | null>;
  create(userId: string, data: { title: string; author: string; coverColor?: string; category: string }): Promise<UserBook>;
  update(id: string, data: Partial<{ title: string; author: string; content: string; coverUrl: string; status: string; readingStatus: string; readingProgress: number; wordCount: number }>): Promise<UserBook | null>;
  delete(id: string, userId: string): Promise<boolean>;
  
  getByUserIdAndStatus(userId: string, status: UserBookStatus): Promise<UserBook[]>;
  getReadingBooks(userId: string): Promise<UserBook[]>;
  getCompletedBooks(userId: string): Promise<UserBook[]>;
  getPublishedBooks(): Promise<UserBook[]>;
  
  saveContent(id: string, content: string, userId: string): Promise<boolean>;
  publish(id: string, userId: string): Promise<UserBook | null>;
  setReadingStatus(id: string, status: ReadingStatus, userId: string): Promise<boolean>;
  setReadingProgress(id: string, progress: number, userId: string): Promise<boolean>;
}