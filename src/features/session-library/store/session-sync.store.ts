import { create } from 'zustand'
import type { MigrationResult } from '@/features/auth/actions/migrate-session-data.action'

type SessionSyncState = {
  isSyncing: boolean
  lastSyncResult: MigrationResult | null
  syncError: string | null
  setSyncing: (syncing: boolean) => void
  setSyncResult: (result: MigrationResult | null) => void
  setSyncError: (error: string | null) => void
  reset: () => void
}

export const useSessionSyncStore = create<SessionSyncState>((set) => ({
  isSyncing: false,
  lastSyncResult: null,
  syncError: null,

  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setSyncResult: (result) => set({ lastSyncResult: result, syncError: null }),
  setSyncError: (error) => set({ syncError: error, lastSyncResult: null }),
  reset: () => set({ isSyncing: false, lastSyncResult: null, syncError: null }),
}))
