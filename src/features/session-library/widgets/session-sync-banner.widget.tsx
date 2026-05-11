'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/shared/storage/use-auth-store'
import { getAnonymousSessionId } from '@/shared/lib/anonymous-session'
import { migrateSessionDataAction } from '@/features/auth/actions/migrate-session-data.action'
import { syncPendingActions } from '@/shared/lib/anonymous-persistence'
import { useSessionSyncStore } from '../store/session-sync.store'
import { clearCache } from '../lib/session-cache'
import { CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'

export function SessionSyncBanner() {
  const { user, isInitialized } = useAuthStore()
  const { isSyncing, lastSyncResult, syncError, setSyncing, setSyncResult, setSyncError, reset } =
    useSessionSyncStore()
  const [dismissed, setDismissed] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  const triggerSync = useCallback(async () => {
    const sessionId = getAnonymousSessionId()
    if (!sessionId) return

    setSyncing(true)
    try {
      const result = await migrateSessionDataAction(sessionId)
      if (result.success) {
        try {
          const pendingResult = await syncPendingActions(user!.id)
          setSyncResult({
            ...result,
            migrated: {
              follows: result.migrated.follows + pendingResult.synced,
              ratings: result.migrated.ratings,
              favorites: result.migrated.favorites,
            },
          })
        } catch {
          setSyncResult(result)
        }
        clearCache()
        setHasSynced(true)
      } else {
        setSyncError(result.error || 'Erro ao sincronizar')
      }
    } catch (err) {
      setSyncError('Erro ao sincronizar dados')
    } finally {
      setSyncing(false)
    }
  }, [user, setSyncing, setSyncResult, setSyncError])

  useEffect(() => {
    if (isInitialized && user && !hasSynced && !isSyncing && !lastSyncResult && !syncError) {
      triggerSync()
    }
  }, [isInitialized, user, hasSynced, isSyncing, lastSyncResult, syncError, triggerSync])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    reset()
  }, [reset])

  if (dismissed) return null

  if (isSyncing) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-accent-500/10 border border-accent-500/20 px-4 py-3 text-sm text-accent-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Sincronizando seus dados com sua conta...</span>
      </div>
    )
  }

  if (lastSyncResult && hasSynced) {
    const total =
      lastSyncResult.migrated.follows +
      lastSyncResult.migrated.ratings +
      lastSyncResult.migrated.favorites

    if (total === 0) return null

    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>
            {total} {total === 1 ? 'dado sincronizado' : 'dados sincronizados'}!
            Agora seus favoritos estão na sua conta.
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-emerald-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (syncError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {syncError}.{' '}
            <button
              type="button"
              onClick={triggerSync}
              className="underline font-medium hover:text-red-800"
            >
              Tentar novamente
            </button>
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return null
}
