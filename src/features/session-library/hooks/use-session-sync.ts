'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/shared/storage/use-auth-store'
import { getAnonymousSessionId } from '@/shared/lib/anonymous-session'
import { migrateSessionDataAction } from '@/features/auth/actions/migrate-session-data.action'
import { syncPendingActions } from '@/shared/lib/anonymous-persistence'
import { useSessionSyncStore } from '../store/session-sync.store'
import { clearCache } from '../lib/session-cache'

interface UseSessionSyncReturn {
  isSyncing: boolean
  lastSyncResult: Awaited<ReturnType<typeof migrateSessionDataAction>> | null
  syncError: string | null
  triggerSync: () => Promise<void>
  reset: () => void
}

export function useSessionSync(): UseSessionSyncReturn {
  const { user } = useAuthStore()
  const store = useSessionSyncStore()

  const triggerSync = useCallback(async () => {
    const sessionId = getAnonymousSessionId()
    if (!sessionId) return

    store.setSyncing(true)
    try {
      const result = await migrateSessionDataAction(sessionId)
      if (result.success) {
        try {
          const pendingResult = await syncPendingActions(user!.id)
          store.setSyncResult({
            ...result,
            migrated: {
              follows: result.migrated.follows + pendingResult.synced,
              ratings: result.migrated.ratings,
              favorites: result.migrated.favorites,
            },
          })
        } catch {
          store.setSyncResult(result)
        }
        clearCache()
      } else {
        store.setSyncError(result.error || 'Erro ao sincronizar')
      }
    } catch {
      store.setSyncError('Erro ao sincronizar dados')
    } finally {
      store.setSyncing(false)
    }
  }, [user, store])

  return {
    isSyncing: store.isSyncing,
    lastSyncResult: store.lastSyncResult,
    syncError: store.syncError,
    triggerSync,
    reset: store.reset,
  }
}
