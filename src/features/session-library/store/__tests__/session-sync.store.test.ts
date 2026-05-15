import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionSyncStore } from '../session-sync.store'

describe('session-sync.store', () => {
  beforeEach(() => {
    useSessionSyncStore.getState().reset()
  })

  it('initializes with default state', () => {
    const state = useSessionSyncStore.getState()
    expect(state.isSyncing).toBe(false)
    expect(state.lastSyncResult).toBeNull()
    expect(state.syncError).toBeNull()
  })

  it('setSyncing updates isSyncing', () => {
    const { setSyncing } = useSessionSyncStore.getState()

    setSyncing(true)
    expect(useSessionSyncStore.getState().isSyncing).toBe(true)

    setSyncing(false)
    expect(useSessionSyncStore.getState().isSyncing).toBe(false)
  })

  it('setSyncResult stores the result', () => {
    const { setSyncResult } = useSessionSyncStore.getState()
    const mockResult = {
      success: true,
      migrated: { favorites: 3, follows: 2, ratings: 0 }
    }

    setSyncResult(mockResult as any)
    expect(useSessionSyncStore.getState().lastSyncResult).toEqual(mockResult)
    expect(useSessionSyncStore.getState().syncError).toBeNull()
  })

  it('setSyncError stores the error', () => {
    const { setSyncError } = useSessionSyncStore.getState()
    const errorMessage = 'Falha na sincronização'

    setSyncError(errorMessage)
    expect(useSessionSyncStore.getState().syncError).toBe(errorMessage)
    expect(useSessionSyncStore.getState().lastSyncResult).toBeNull()
  })

  it('reset clears all state', () => {
    const { setSyncing, setSyncResult, reset } = useSessionSyncStore.getState()

    setSyncing(true)
    setSyncResult({ success: true, migrated: { favorites: 1, follows: 0, ratings: 0 } } as any)

    reset()
    const state = useSessionSyncStore.getState()
    expect(state.isSyncing).toBe(false)
    expect(state.lastSyncResult).toBeNull()
    expect(state.syncError).toBeNull()
  })
})
