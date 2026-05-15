import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  savePendingAction,
  getPendingActions,
  clearPendingActions,
  syncPendingActions,
  type PendingAction,
} from '../anonymous-persistence'

const PENDING_ACTIONS_KEY = 'pending_actions'

const mockAddToFavorites = vi.fn()
const mockFollowAuthor = vi.fn()
const mockRateBook = vi.fn()

vi.mock('@/features/discovery/actions/favorites.actions', () => ({
  addToFavorites: (...args: any[]) => mockAddToFavorites(...args),
}))

vi.mock('@/features/author-follow/actions/author-follow.actions', () => ({
  followAuthor: (...args: any[]) => mockFollowAuthor(...args),
}))

vi.mock('@/features/book-details/actions/rate-book.action', () => ({
  rateBook: (...args: any[]) => mockRateBook(...args),
}))

function createAction(overrides: Partial<PendingAction> = {}): PendingAction {
  return {
    type: 'favorite',
    payload: { bookId: 'book-1' },
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('anonymous-persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('savePendingAction', () => {
    it('saves an action to localStorage', () => {
      const action = createAction()

      savePendingAction(action)

      const stored = JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY)!)
      expect(stored).toHaveLength(1)
      expect(stored[0].type).toBe('favorite')
    })

    it('appends to existing actions', () => {
      savePendingAction(createAction({ type: 'favorite' }))
      savePendingAction(createAction({ type: 'follow', payload: { authorName: 'Author' } }))

      const stored = JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY)!)
      expect(stored).toHaveLength(2)
    })
  })

  describe('getPendingActions', () => {
    it('returns empty array when no actions stored', () => {
      const actions = getPendingActions()
      expect(actions).toEqual([])
    })

    it('returns stored actions', () => {
      const action = createAction()
      savePendingAction(action)

      const actions = getPendingActions()

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('favorite')
    })

    it('filters out expired actions', () => {
      const expiredAction = createAction({
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
      })
      savePendingAction(expiredAction)
      savePendingAction(createAction())

      const actions = getPendingActions()

      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('favorite')
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem(PENDING_ACTIONS_KEY, 'invalid-json')

      const actions = getPendingActions()

      expect(actions).toEqual([])
    })

    it('clears corrupted data from localStorage', () => {
      localStorage.setItem(PENDING_ACTIONS_KEY, 'invalid-json')

      getPendingActions()

      expect(localStorage.getItem(PENDING_ACTIONS_KEY)).toBeNull()
    })
  })

  describe('clearPendingActions', () => {
    it('removes all pending actions', () => {
      savePendingAction(createAction())
      clearPendingActions()

      expect(localStorage.getItem(PENDING_ACTIONS_KEY)).toBeNull()
    })

    it('returns empty array after clearing', () => {
      savePendingAction(createAction())
      clearPendingActions()

      const actions = getPendingActions()
      expect(actions).toEqual([])
    })
  })

  describe('syncPendingActions', () => {
    it('returns zero counts when no pending actions', async () => {
      const result = await syncPendingActions('user-123')

      expect(result).toEqual({ synced: 0, failed: 0 })
    })

    it('processes favorite actions successfully', async () => {
      mockAddToFavorites.mockResolvedValue({ success: true })

      savePendingAction(createAction({ type: 'favorite', payload: { bookId: 'book-1' } }))

      const result = await syncPendingActions('user-123')

      expect(result).toEqual({ synced: 1, failed: 0 })
    })

    it('handles failed actions gracefully', async () => {
      mockAddToFavorites.mockResolvedValue({ success: false })

      savePendingAction(createAction({ type: 'favorite', payload: { bookId: 'book-1' } }))

      const result = await syncPendingActions('user-123')

      expect(result).toEqual({ synced: 0, failed: 1 })
    })

    it('clears all actions when all succeed', async () => {
      mockAddToFavorites.mockResolvedValue({ success: true })

      savePendingAction(createAction({ type: 'favorite', payload: { bookId: 'book-1' } }))
      savePendingAction(createAction({ type: 'favorite', payload: { bookId: 'book-2' } }))

      const result = await syncPendingActions('user-123')

      expect(result).toEqual({ synced: 2, failed: 0 })
    })
  })
})
