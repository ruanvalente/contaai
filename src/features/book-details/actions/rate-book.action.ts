'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { getSupabaseServerClient } from '@/utils/supabase/server'

export type RateBookResult =
  | { success: true; newRating: number; ratingCount: number }
  | { success: false; error: string }

export async function rateBook(
  bookId: string,
  rating: number,
  sessionId?: string
): Promise<RateBookResult> {
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Avaliação deve ser entre 1 e 5 estrelas' }
  }

  try {
    const userId = await getCurrentUserIdOptional()
    const supabase = await getSupabaseServerClient()

    // Check if book exists in unified_books view (books + user_books)
    const { data: bookExists } = await supabase
      .from('unified_books')
      .select('id')
      .eq('id', bookId)
      .single()

    if (!bookExists) {
      return { success: false, error: 'Livro não encontrado para avaliação' }
    }

    // Build rating data
    const ratingData: any = {
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
      // Use provided session_id or generate new one
      const finalSessionId = sessionId || ('anonymous-' + Math.random().toString(36).substring(7))
      ratingData.session_id = finalSessionId
      ratingData.rated_by_type = 'anonymous'
      ratingData.user_id = null
      query = query.eq('session_id', finalSessionId).is('user_id', null)
    }

    // Check if rating already exists
    const { data: existing } = await query.single()

    let error
    if (existing?.id) {
      // UPDATE existing rating
      const updateData: any = { rating: rating }
      if (userId) {
        updateData.user_id = userId
      } else {
        updateData.session_id = ratingData.session_id
        updateData.user_id = null
      }

      const result = await supabase
        .from('ratings')
        .update(updateData)
        .eq('id', existing.id)
      error = result.error
    } else {
      // INSERT new rating
      const result = await supabase
        .from('ratings')
        .insert(ratingData)
      error = result.error
    }

    if (error) {
      console.error('Error rating book:', error)
      return { success: false, error: 'Erro ao avaliar livro' }
    }

    // Buscar média atualizada (trigger atualiza automaticamente)
    const { data: bookData } = await supabase
      .from('unified_books')
      .select('rating, rating_count')
      .eq('id', bookId)
      .single()

    return { 
      success: true, 
      newRating: bookData?.rating || rating, 
      ratingCount: bookData?.rating_count || 0 
    }
  } catch (err) {
    console.error('Error in rateBook:', err)
    return { success: false, error: 'Erro interno' }
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
