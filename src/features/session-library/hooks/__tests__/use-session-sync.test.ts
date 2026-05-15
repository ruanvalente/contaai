import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockMigrate = vi.fn()
const mockSyncPending = vi.fn()
const mockGetSessionId = vi.fn()

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => {
      const state = { user: { id: 'user-123' }, isInitialized: true }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: { id: 'user-123' }, isInitialized: true }) }
  )
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: () => mockGetSessionId()
}))

vi.mock('@/features/auth/actions/migrate-session-data.action', () => ({
  migrateSessionDataAction: (...args: any[]) => mockMigrate(...args)
}))

vi.mock('@/shared/lib/anonymous-persistence', () => ({
  syncPendingActions: (...args: any[]) => mockSyncPending(...args)
}))

vi.mock('../lib/session-cache', () => ({
  clearCache: vi.fn()
}))

import { useSessionSync } from '../use-session-sync'
import { useSessionSyncStore } from '../../store/session-sync.store'

describe('useSessionSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionSyncStore.getState().reset()
    mockGetSessionId.mockReturnValue('session-abc')
    mockMigrate.mockResolvedValue({
      success: true,
      migrated: { follows: 3, favorites: 5, ratings: 0 }
    })
    mockSyncPending.mockResolvedValue({ synced: 0, failed: 0 })
  })

  it('returns initial default state', () => {
    const { result } = renderHook(() => useSessionSync())

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.lastSyncResult).toBeNull()
    expect(result.current.syncError).toBeNull()
  })

  it('triggerSync calls migrateSessionDataAction with sessionId', async () => {
    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(mockGetSessionId).toHaveBeenCalled()
    expect(mockMigrate).toHaveBeenCalledWith('session-abc')
  })

  it('triggerSync stores result on success', async () => {
    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(result.current.lastSyncResult).toEqual({
      success: true,
      migrated: { follows: 3, favorites: 5, ratings: 0 }
    })
    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBeNull()
  })

  it('triggerSync stores error on failure', async () => {
    mockMigrate.mockResolvedValue({
      success: false,
      migrated: { follows: 0, favorites: 0, ratings: 0 },
      error: 'Sync failed'
    })

    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(result.current.syncError).toBe('Sync failed')
    expect(result.current.isSyncing).toBe(false)
  })

  it('triggerSync handles exception gracefully', async () => {
    mockMigrate.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(result.current.syncError).toBe('Erro ao sincronizar dados')
    expect(result.current.isSyncing).toBe(false)
  })

  it('reset clears all state', async () => {
    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(result.current.lastSyncResult).toBeTruthy()

    await act(async () => {
      result.current.reset()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.lastSyncResult).toBeNull()
    expect(result.current.syncError).toBeNull()
  })

  it('does nothing if no sessionId', async () => {
    mockGetSessionId.mockReturnValue('')

    const { result } = renderHook(() => useSessionSync())

    await act(async () => {
      await result.current.triggerSync()
    })

    expect(mockMigrate).not.toHaveBeenCalled()
  })
})
