'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { getSupabaseServerClient } from '@/utils/supabase/server'
import type { SessionFavoriteBook } from '../types/session-library.types'

export async function getSessionFavoritesAction(
  sessionId?: string
): Promise<SessionFavoriteBook[]> {
  try {
    const userId = await getCurrentUserIdOptional()
    const supabase = await getSupabaseServerClient()

    if (userId) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) return []
      return mapFavorites(data)
    }

    if (!sessionId) return []

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('session_id', sessionId)
      .is('user_id', null)
      .order('created_at', { ascending: false })

    if (error) return []
    return mapFavorites(data)
  } catch {
    return []
  }
}

function mapFavorites(data: any[]): SessionFavoriteBook[] {
  return (data || []).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    bookCoverUrl: row.book_cover_url || null,
    bookCoverColor: row.book_cover_color || null,
    bookCategory: row.book_category || null,
    favoritedAt: row.created_at || new Date().toISOString(),
  }))
}
