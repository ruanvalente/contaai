import { Category, CATEGORIES } from "./book.types";

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
  category: Exclude<Category, "All">;
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
  category: Exclude<Category, "All">;
};

export type UpdateUserBookInput = Partial<CreateUserBookInput> & {
  content?: string;
  status?: UserBookStatus;
  readingStatus?: ReadingStatus;
  readingProgress?: number;
  wordCount?: number;
};

export const USER_BOOK_CATEGORIES: Exclude<Category, "All">[] =
  CATEGORIES.filter((c): c is Exclude<Category, "All"> => c !== "All");

export const COVER_COLORS = [
  "#8B4513", // Saddle Brown
  "#2E4A62", // Dark Blue
  "#4A2E4A", // Dark Purple
  "#2E4A2E", // Dark Green
  "#4A4A2E", // Dark Olive
  "#622E4A", // Dark Rose
  "#1E3A5F", // Navy
  "#3D5A45", // Forest Green
  "#5C4033", // Coffee
  "#4A5568", // Gray
];

export function generateRandomCoverColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}
