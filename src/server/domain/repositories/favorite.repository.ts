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
  title: string;
  author: string;
  coverColor?: string;
  coverUrl?: string;
  category?: string;
};

export interface IFavoriteRepository {
  add(userId: string, book: FavoriteBook): Promise<boolean>;
  remove(userId: string, bookId: string): Promise<boolean>;
  getByUser(userId: string): Promise<UserFavorite[]>;
  isFavorited(userId: string, bookId: string): Promise<boolean>;
}