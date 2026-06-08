"use server"

import { getCurrentUserId } from "@/utils/auth/get-current-user.server"
import { getSupabaseServerClient } from "@/utils/supabase/server"

export type MigrationResult = {
  success: boolean
  migrated: { follows: number; ratings: number; favorites: number }
  error?: string
}

export async function migrateSessionDataAction(sessionId: string): Promise<MigrationResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, migrated: { follows: 0, ratings: 0, favorites: 0 }, error: "Usuário não autenticado" }
    }

    const supabase = await getSupabaseServerClient()

    const migrateFollows = await supabase.rpc('migrate_session_follows', {
      p_session_id: sessionId,
      p_user_id: userId,
    })

    const migrateRatings = await supabase.rpc('migrate_session_ratings', {
      p_session_id: sessionId,
      p_user_id: userId,
    })

    const migrateFavorites = await supabase.rpc('migrate_session_favorites', {
      p_session_id: sessionId,
      p_user_id: userId,
    })

    return {
      success: true,
      migrated: {
        follows: migrateFollows.data ?? 0,
        ratings: migrateRatings.data ?? 0,
        favorites: migrateFavorites.data ?? 0,
      },
    }
  } catch (err) {
    console.error("Error migrating session data:", err)
    return { success: false, migrated: { follows: 0, ratings: 0, favorites: 0 }, error: "Erro ao migrar dados da sessão" }
  }
}
