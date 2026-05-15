import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'

const mockMigrate = vi.fn()
const mockGetSessionId = vi.fn()
const mockSyncPending = vi.fn()

let mockAuthUser: any = null

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => {
      const state = { user: mockAuthUser, isInitialized: true }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: mockAuthUser, isInitialized: true }) }
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

vi.mock('../../lib/session-cache', () => ({
  clearCache: vi.fn()
}))

import { SessionSyncBanner } from '../session-sync-banner.widget'
import { useSessionSyncStore } from '../../store/session-sync.store'

describe('SessionSyncBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionSyncStore.getState().reset()
    mockGetSessionId.mockReturnValue('session-abc')
    mockMigrate.mockResolvedValue({
      success: true,
      migrated: { follows: 3, favorites: 5, ratings: 0 }
    })
    mockSyncPending.mockResolvedValue({ synced: 0, failed: 0 })
    mockAuthUser = null
  })

  it('renders nothing when user is not authenticated', () => {
    const { container } = render(<SessionSyncBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renders syncing state when store isSyncing is true', () => {
    act(() => {
      useSessionSyncStore.getState().setSyncing(true)
    })

    render(<SessionSyncBanner />)
    expect(screen.getByText('Sincronizando seus dados com sua conta...')).toBeDefined()
  })

  it('renders error banner with retry button', () => {
    act(() => {
      useSessionSyncStore.getState().setSyncError('Falha na sincronização')
    })

    render(<SessionSyncBanner />)
    expect(screen.getByText(/Falha na sincronização/)).toBeDefined()
    expect(screen.getByText('Tentar novamente')).toBeDefined()
  })

  it('dismisses error banner on close', () => {
    act(() => {
      useSessionSyncStore.getState().setSyncError('Falha na sincronização')
    })

    render(<SessionSyncBanner />)
    const dismissBtn = screen.getByLabelText('Fechar')
    act(() => { dismissBtn.click() })
    expect(screen.queryByText(/Falha na sincronização/)).toBeNull()
  })

  it('renders success banner after auto-sync completes', async () => {
    mockAuthUser = { id: 'user-123', email: 'test@test.com' }

    render(<SessionSyncBanner />)

    await waitFor(() => {
      expect(screen.getByText(/8 dados sincronizados/)).toBeDefined()
    })
  })

  it('renders nothing when auto-sync migrates zero items', async () => {
    mockAuthUser = { id: 'user-123', email: 'test@test.com' }
    mockMigrate.mockResolvedValue({
      success: true,
      migrated: { follows: 0, favorites: 0, ratings: 0 }
    })

    const { container } = render(<SessionSyncBanner />)

    await waitFor(() => {
      expect(container.innerHTML).toBe('')
    })
  })

  it('renders error when auto-sync fails', async () => {
    mockAuthUser = { id: 'user-123', email: 'test@test.com' }
    mockMigrate.mockResolvedValue({
      success: false,
      migrated: { follows: 0, favorites: 0, ratings: 0 },
      error: 'Sync failed'
    })

    render(<SessionSyncBanner />)

    await waitFor(() => {
      expect(screen.getByText(/Sync failed/)).toBeDefined()
    })
  })

  it('dismisses success banner on close', async () => {
    mockAuthUser = { id: 'user-123', email: 'test@test.com' }

    render(<SessionSyncBanner />)

    await waitFor(() => {
      expect(screen.getByText(/8 dados sincronizados/)).toBeDefined()
    })

    const dismissBtn = screen.getByLabelText('Fechar')
    act(() => { dismissBtn.click() })

    expect(screen.queryByText(/8 dados sincronizados/)).toBeNull()
  })
})
