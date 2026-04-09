import { z } from 'zod';

export const bookCategoryEnum = z.enum([
  'fiction',
  'non-fiction',
  'science-fiction',
  'fantasy',
  'romance',
  'mystery',
  'thriller',
  'horror',
  'biography',
  'self-help',
  'business',
  'history',
  'science',
  'philosophy',
  'poetry',
  'children',
  'young-adult',
  'other'
]);

export const bookStatusEnum = z.enum(['draft', 'published']);

export const readingStatusEnum = z.enum(['none', 'reading', 'completed']);

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  author: z.string().min(1, 'Author is required').max(100, 'Author too long'),
  coverUrl: z.string().url().optional(),
  coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  category: bookCategoryEnum,
  content: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial().extend({
  status: bookStatusEnum.optional(),
  readingStatus: readingStatusEnum.optional(),
  readingProgress: z.number().min(0).max(100).optional(),
});

export const publishBookSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
});

export const deleteBookSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type PublishBookInput = z.infer<typeof publishBookSchema>;
export type DeleteBookInput = z.infer<typeof deleteBookSchema>;