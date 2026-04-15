import { BookCategory } from "./book.entity";

export type UserBookStatus = "draft" | "published";
export type ReadingStatus = "none" | "reading" | "completed";

export type UserBook = {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  content?: string;
  contentUrl?: string;
  status: UserBookStatus;
  readingStatus: ReadingStatus;
  readingProgress: number;
  category: BookCategory;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
};

export type UserBookListItem = Pick<
  UserBook,
  | "id"
  | "title"
  | "author"
  | "coverUrl"
  | "coverColor"
  | "status"
  | "readingStatus"
  | "readingProgress"
  | "category"
  | "createdAt"
>;

export type CreateUserBookInput = {
  title: string;
  author: string;
  coverUrl?: string;
  coverColor?: string;
  category: BookCategory;
};

export type UpdateUserBookInput = Partial<CreateUserBookInput> & {
  content?: string;
  status?: UserBookStatus;
  readingStatus?: ReadingStatus;
  readingProgress?: number;
  wordCount?: number;
};