import { z } from "zod";
import { BOOK_CATEGORIES } from "@/server/domain/entities/book.entity";

export const getBooksSchema = z.object({
  category: z.enum(BOOK_CATEGORIES as [string, ...string[]]).optional(),
  search: z.string().max(200).optional(),
});

export const searchBooksSchema = z.object({
  query: z.string().min(1).max(200),
});

export type GetBooksInput = z.infer<typeof getBooksSchema>;
export type SearchBooksInput = z.infer<typeof searchBooksSchema>;
