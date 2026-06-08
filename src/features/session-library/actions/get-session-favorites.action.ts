'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { SupabaseFavoriteRepository } from '@/server/infrastructure/database/supabase-favorite.repository'
import type { SessionFavoriteBook } from '../types/session-library.types'

const favoriteRepository = new SupabaseFavoriteRepository()

export async function getSessionFavoritesAction(
  sessionId?: string
): Promise<SessionFavoriteBook[]> {
  try {
    const userId = await getCurrentUserIdOptional()
    const effectiveUserId = userId || sessionId

    if (!effectiveUserId) return []

    const favorites = await favoriteRepository.getByUser(effectiveUserId)

    return favorites.map((f) => ({
      id: f.id,
      bookId: f.bookId,
      bookTitle: f.bookTitle,
      bookAuthor: f.bookAuthor,
      bookCoverUrl: f.bookCoverUrl ?? null,
      bookCoverColor: f.bookCoverColor ?? null,
      bookCategory: f.bookCategory ?? null,
      favoritedAt: f.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}
