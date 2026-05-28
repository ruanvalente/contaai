import { z } from "zod";
import { BOOK_CATEGORIES } from "@/server/domain/entities/book.entity";

export const createUserBookSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  author: z.string().min(1, "Autor é obrigatório").max(200),
  coverUrl: z.string().url().optional(),
  coverColor: z.string().optional(),
  category: z.enum(BOOK_CATEGORIES as [string, ...string[]]),
});

export const updateUserBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(200).optional(),
  coverUrl: z.string().url().optional(),
  coverColor: z.string().optional(),
  category: z.enum(BOOK_CATEGORIES as [string, ...string[]]).optional(),
  content: z.string().optional(),
  readingProgress: z.number().int().min(0).max(100).optional(),
});

export const ratingSchema = z.object({
  bookId: z.string().min(1),
  rating: z.number().int().min(1, "Avaliação deve ser entre 1 e 5").max(5, "Avaliação deve ser entre 1 e 5"),
});

export type CreateUserBookInput = z.infer<typeof createUserBookSchema>;
export type UpdateUserBookInput = z.infer<typeof updateUserBookSchema>;
