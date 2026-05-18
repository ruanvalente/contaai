'use server'

import { getSupabaseServerClient } from '@/utils/supabase/server'

export async function clearSessionDataAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const supabase = await getSupabaseServerClient()

    const { error: favError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('session_id', sessionId)
      .is('user_id', null)

    if (favError) {
      return { success: false, error: 'Failed to clear favorites' }
    }

    const { error: followError } = await supabase
      .from('author_follow')
      .delete()
      .eq('session_id', sessionId)
      .is('user_id', null)

    if (followError) {
      return { success: false, error: 'Failed to clear followed authors' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Internal error' }
  }
}
