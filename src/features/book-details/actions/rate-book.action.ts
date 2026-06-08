'use server'

import { cache } from 'react'
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { SupabaseRatingRepository } from '@/server/infrastructure/database/supabase-rating.repository'
import type { ActionResult } from '@/shared/types/action-result'
import { success, failure } from '@/shared/types/action-result'

const ratingRepository = new SupabaseRatingRepository()

export async function rateBook(
  bookId: string,
  rating: number,
  sessionId?: string
): Promise<ActionResult<{ newRating: number; ratingCount: number }>> {
  if (rating < 1 || rating > 5) {
    return failure('INVALID_RATING', 'Avaliação deve ser entre 1 e 5 estrelas')
  }

  try {
    const userId = await getCurrentUserIdOptional()

    const bookExists = await ratingRepository.checkBookExists(bookId)
    if (!bookExists) {
      return failure('BOOK_NOT_FOUND', 'Livro não encontrado para avaliação')
    }

    const success_ = await ratingRepository.upsertRating(bookId, rating, userId, sessionId)
    if (!success_) {
      return failure('RATE_ERROR', 'Erro ao avaliar livro')
    }

    const bookData = await ratingRepository.getBookRatingData(bookId)
    return success({
      newRating: bookData?.newRating || rating,
      ratingCount: bookData?.ratingCount || 0
    })
  } catch (err) {
    console.error('Error in rateBook:', err)
    return failure('RATE_ERROR', 'Erro interno')
  }
}

export const getUserRating = cache(async (bookId: string, sessionId?: string): Promise<number | null> => {
  try {
    const userId = await getCurrentUserIdOptional()
    return ratingRepository.getUserRating(bookId, userId, sessionId)
  } catch {
    return null
  }
})
