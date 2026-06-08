'use server'

import { SupabaseFavoriteRepository } from '@/server/infrastructure/database/supabase-favorite.repository'
import { SupabaseAuthorFollowRepository } from '@/server/infrastructure/database/supabase-author-follow.repository'

const favoriteRepository = new SupabaseFavoriteRepository()
const authorFollowRepository = new SupabaseAuthorFollowRepository()

export async function clearSessionDataAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const favOk = await favoriteRepository.clearSession(sessionId)
    if (!favOk) {
      return { success: false, error: 'Failed to clear favorites' }
    }

    const followOk = await authorFollowRepository.clearSession(sessionId)
    if (!followOk) {
      return { success: false, error: 'Failed to clear followed authors' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Internal error' }
  }
}
