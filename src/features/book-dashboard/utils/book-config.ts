import { BOOK_CATEGORIES } from "@/domain/entities/book.entity";

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

export const USER_BOOK_CATEGORIES = BOOK_CATEGORIES;

export function generateRandomCoverColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}
