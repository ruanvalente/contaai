'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { getSupabaseServerClient } from '@/utils/supabase/server'
import type { ActionResult } from '@/shared/types/action-result'
import { success, failure } from '@/shared/types/action-result'

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
    const supabase = await getSupabaseServerClient()

    const { data: bookExists } = await supabase
      .from('unified_books')
      .select('id')
      .eq('id', bookId)
      .single()

    if (!bookExists) {
      return failure('BOOK_NOT_FOUND', 'Livro não encontrado para avaliação')
    }

    const ratingData: Record<string, unknown> = {
      book_id: bookId,
      rating: rating,
    }

    let query = supabase
      .from('ratings')
      .select('id')
      .eq('book_id', bookId)

    if (userId) {
      ratingData.user_id = userId
      ratingData.rated_by_type = 'user'
      query = query.eq('user_id', userId)
    } else {
      const finalSessionId = sessionId || ('anonymous-' + Math.random().toString(36).substring(7))
      ratingData.session_id = finalSessionId
      ratingData.rated_by_type = 'anonymous'
      ratingData.user_id = null
      query = query.eq('session_id', finalSessionId).is('user_id', null)
    }

    const { data: existing } = await query.single()

    let error
    if (existing?.id) {
      const updateData: Record<string, unknown> = { rating: rating }
      if (userId) {
        updateData.user_id = userId
      } else {
        updateData.session_id = ratingData.session_id as string
        updateData.user_id = null
      }

      const result = await supabase
        .from('ratings')
        .update(updateData)
        .eq('id', existing.id)
      error = result.error
    } else {
      const result = await supabase
        .from('ratings')
        .insert(ratingData)
      error = result.error
    }

    if (error) {
      console.error('Error rating book:', error)
      return failure('RATE_ERROR', 'Erro ao avaliar livro')
    }

    const { data: bookData } = await supabase
      .from('unified_books')
      .select('rating, rating_count')
      .eq('id', bookId)
      .single()

    return success({ 
      newRating: bookData?.rating || rating, 
      ratingCount: bookData?.rating_count || 0 
    })
  } catch (err) {
    console.error('Error in rateBook:', err)
    return failure('RATE_ERROR', 'Erro interno')
  }
}

export async function getUserRating(bookId: string, sessionId?: string): Promise<number | null> {
  try {
    const userId = await getCurrentUserIdOptional()
    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from('ratings')
      .select('rating')
      .eq('book_id', bookId)
      .single()

    if (userId) {
      query = supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single()
    } else if (sessionId) {
      query = supabase
        .from('ratings')
        .select('rating')
        .eq('session_id', sessionId)
        .eq('book_id', bookId)
        .single()
    } else {
      return null
    }

    const { data } = await query
    return data?.rating || null
  } catch {
    return null
  }
}
