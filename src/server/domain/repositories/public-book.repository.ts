import { BookCategory } from "../entities/book.entity"

export type PublicBookListItem = {
  id: string
  title: string
  author: string
  coverUrl?: string
  coverColor: string
  category: BookCategory
  rating: number
  pages: number
  ratingCount: number
  reviewCount: number
}

export type PublicBookDetail = PublicBookListItem & {
  description: string
  createdAt: Date
  source?: string
}

export type PublicBooksFilters = {
  category?: BookCategory
  search?: string
  page?: number
  limit?: number
}

export type PublicBooksResult = {
  books: PublicBookListItem[]
  total: number
  page: number
  totalPages: number
}

export interface IPublicBookRepository {
  getPublicBooks(filters: PublicBooksFilters): Promise<PublicBooksResult>
  getPublicBookById(id: string): Promise<PublicBookDetail | null>
  getFeaturedPublicBooks(limit?: number): Promise<PublicBookListItem[]>
  searchPublicBooks(query: string): Promise<PublicBookListItem[]>
}
