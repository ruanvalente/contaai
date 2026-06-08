export type UserRating = {
  id: string
  bookId: string
  userId?: string
  sessionId?: string
  rating: number
  createdAt: string
}

export type BookRatingData = {
  newRating: number
  ratingCount: number
}

export interface IRatingRepository {
  checkBookExists(bookId: string): Promise<boolean>
  getExistingRating(bookId: string, userId?: string, sessionId?: string): Promise<{ id: string } | null>
  upsertRating(bookId: string, rating: number, userId?: string, sessionId?: string): Promise<boolean>
  getBookRatingData(bookId: string): Promise<BookRatingData | null>
  getUserRating(bookId: string, userId?: string, sessionId?: string): Promise<number | null>
}
