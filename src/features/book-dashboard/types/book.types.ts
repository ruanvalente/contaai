export type Category =
  | "All"
  | "Sci-Fi"
  | "Fantasy"
  | "Drama"
  | "Business"
  | "Education"
  | "Geography";

export const CATEGORIES: Category[] = [
  "All",
  "Sci-Fi",
  "Fantasy",
  "Drama",
  "Business",
  "Education",
  "Geography",
];

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  description: string;
  category: Exclude<Category, "All">;
  pages: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
}

export interface BookStats {
  pages: number;
  ratings: number;
  reviews: number;
}

export type BookListItem = Pick<
  Book,
  | "id"
  | "title"
  | "author"
  | "coverUrl"
  | "coverColor"
  | "category"
  | "rating"
>;
