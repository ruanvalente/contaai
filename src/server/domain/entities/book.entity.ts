export type BookCategory = 
  | "Sci-Fi" 
  | "Fantasy" 
  | "Drama" 
  | "Business" 
  | "Education" 
  | "Geography";

export type Category = "All" | BookCategory;

export const CATEGORIES: Category[] = [
  "All", "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography"
];

export const BOOK_CATEGORIES: BookCategory[] = [
  "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography"
];

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  description: string;
  category: BookCategory;
  pages: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
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

export type BookStats = {
  pages: number;
  ratings: number;
  reviews: number;
};