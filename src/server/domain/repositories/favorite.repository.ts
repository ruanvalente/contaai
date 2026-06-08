export type UserFavorite = {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverColor?: string;
  bookCoverUrl?: string;
  bookCategory?: string;
  createdAt: Date;
};

export type FavoriteBook = {
  id: string;
};

export interface IFavoriteRepository {
  add(userId: string | null, book: FavoriteBook): Promise<boolean>;
  remove(userId: string, bookId: string): Promise<boolean>;
  getByUser(userId: string): Promise<UserFavorite[]>;
  isFavorited(userId: string | null, bookId: string): Promise<boolean>;
  countByBookId(bookId: string): Promise<number>;
  clearSession(sessionId: string): Promise<boolean>;
}
