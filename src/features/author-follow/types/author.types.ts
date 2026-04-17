export type Author = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
  age?: number;
  createdAt: Date;
};

export type AuthorWithBooks = Author & {
  books: AuthorBook[];
};

export type AuthorBook = {
  id: string;
  title: string;
  coverColor?: string;
  coverUrl?: string;
};

export type AuthorFollow = {
  id: string;
  userId: string;
  authorId: string;
  createdAt: Date;
};