export interface SessionFavoriteBook {
  id: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCoverUrl: string | null
  bookCoverColor: string | null
  bookCategory: string | null
  favoritedAt: string
}

export interface SessionFollowedAuthor {
  authorName: string
  avatarUrl: string | null
  bio: string | null
  booksCount: number
  followedAt: string
}

export interface SessionCacheData {
  favorites: SessionFavoriteBook[]
  authors: SessionFollowedAuthor[]
  timestamp: number
  sessionId: string
}

export type SessionTab = 'favorites' | 'authors'
