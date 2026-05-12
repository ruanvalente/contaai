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

    let favorites;

    if (userId) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id, book_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) return []
      favorites = data || []
    } else if (sessionId) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id, book_id, created_at')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .order('created_at', { ascending: false })

      if (error) return []
      favorites = data || []
    } else {
      return []
    }

    if (favorites.length === 0) return []

    // Batch-fetch book metadata from unified_books
    const bookIds = favorites.map(f => f.book_id)
    const { data: books } = await supabase
      .from("unified_books")
      .select("id, title, author, cover_color, cover_url, category")
      .in("id", bookIds)

    const bookMap = new Map(
      (books || []).map(b => [b.id, b])
    )

    return favorites.map((row) => {
      const book = bookMap.get(row.book_id)
      return {
        id: row.id,
        bookId: row.book_id,
        bookTitle: book?.title ?? 'Unknown',
        bookAuthor: book?.author ?? 'Unknown',
        bookCoverUrl: book?.cover_url ?? null,
        bookCoverColor: book?.cover_color ?? null,
        bookCategory: book?.category ?? null,
        favoritedAt: row.created_at || new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}
