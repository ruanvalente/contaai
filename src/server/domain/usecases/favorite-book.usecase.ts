import { FavoriteBook } from "../entities/favorite.entity";

export interface FavoriteBookInput {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverColor?: string;
  bookCoverUrl?: string;
  bookCategory?: string;
}

export type FavoriteBookResult = 
  | { success: true }
  | { success: false; error: string };

export interface IFavoriteBookRepository {
  add(input: FavoriteBookInput, userId: string): Promise<FavoriteBookResult>;
  remove(bookId: string, userId: string): Promise<FavoriteBookResult>;
  getByUser(userId: string): Promise<FavoriteBook[]>;
  isFavorited(bookId: string, userId: string): Promise<boolean>;
}