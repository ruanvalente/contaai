import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIs = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()

mockIs.mockResolvedValue({ data: [], error: null })
mockEq.mockImplementation((key: string) => {
  if (key === 'user_id') return { data: [{ author_name: 'Author 1' }], error: null }
  return { is: mockIs }
})
mockSelect.mockReturnValue({ eq: mockEq })
mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, delete: mockDelete })
mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

const mockGetSessionId = vi.fn()

const mockAuthState: { user: any; isInitialized: boolean } = {
  user: null,
  isInitialized: true,
}

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: () => mockGetSessionId(),
}))

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => selector ? selector(mockAuthState) : mockAuthState,
    { getState: () => mockAuthState }
  ),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

const mockFollowAuthor = vi.fn()
const mockUnfollowAuthor = vi.fn()

vi.mock('@/features/author-follow/actions/author-follow.actions', () => ({
  followAuthor: (...args: any[]) => mockFollowAuthor(...args),
  unfollowAuthor: (...args: any[]) => mockUnfollowAuthor(...args),
}))

import { useAuthorFollowStore } from '../use-author-follow'

describe('useAuthorFollowStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.user = null
    mockAuthState.isInitialized = true
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockGetSessionId.mockReturnValue('session-abc')
    mockFollowAuthor.mockResolvedValue({ ok: true } as any)
    mockUnfollowAuthor.mockResolvedValue({ ok: true } as any)
    mockIs.mockResolvedValue({ data: [], error: null })
    mockEq.mockImplementation((key: string) => {
      if (key === 'user_id') return { data: [{ author_name: 'Author 1' }], error: null }
      return { is: mockIs }
    })

    useAuthorFollowStore.setState({
      followedIds: [],
      isLoading: false,
      isInitialized: false,
    })
  })

  describe('initial state', () => {
    it('starts with empty followedIds', () => {
      const state = useAuthorFollowStore.getState()
      expect(state.followedIds).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(false)
    })

    it('isFollowing returns false for unknown author', () => {
      expect(useAuthorFollowStore.getState().isFollowing('Unknown')).toBe(false)
    })

    it('isFollowing returns true for followed author', () => {
      act(() => {
        useAuthorFollowStore.setState({ followedIds: ['Author 1'] })
      })
      expect(useAuthorFollowStore.getState().isFollowing('Author 1')).toBe(true)
    })
  })

  describe('initialize', () => {
    it('loads followedIds for authenticated user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

      act(() => {
        useAuthorFollowStore.getState().initialize()
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isInitialized).toBe(true)
      })

      const state = useAuthorFollowStore.getState()
      expect(state.followedIds).toEqual(['Author 1'])
      expect(mockFrom).toHaveBeenCalledWith('author_follow')
    })

    it('loads followedIds for anonymous session', async () => {
      mockGetSessionId.mockReturnValue('session-xyz')
      mockEq.mockImplementation((key: string) => {
        if (key === 'session_id') return { is: mockIs }
        return { data: [], error: null }
      })
      mockIs.mockResolvedValue({ data: [{ author_name: 'Session Author' }], error: null })

      act(() => {
        useAuthorFollowStore.getState().initialize()
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isInitialized).toBe(true)
      })

      const state = useAuthorFollowStore.getState()
      expect(state.followedIds).toEqual(['Session Author'])
    })

    it('sets initialized when no user and no session', async () => {
      mockGetSessionId.mockReturnValue(null)

      act(() => {
        useAuthorFollowStore.getState().initialize()
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isInitialized).toBe(true)
      })

      expect(useAuthorFollowStore.getState().followedIds).toEqual([])
    })

    it('handles error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetUser.mockRejectedValue(new Error('Network error'))

      act(() => {
        useAuthorFollowStore.getState().initialize()
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isInitialized).toBe(true)
      })

      consoleSpy.mockRestore()
    })
  })

  describe('follow', () => {
    it('calls followAuthor and updates state on success', async () => {
      act(() => {
        useAuthorFollowStore.getState().follow('Author 2')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().followedIds).toContain('Author 2')
      })

      expect(mockFollowAuthor).toHaveBeenCalledWith('Author 2', 'session-abc')
      expect(useAuthorFollowStore.getState().isLoading).toBe(false)
    })

    it('does not update state when followAuthor fails', async () => {
      mockFollowAuthor.mockResolvedValue({ ok: false, error: { code: 'ERROR', message: 'Error' } } as any)

      act(() => {
        useAuthorFollowStore.getState().follow('Author 2')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isLoading).toBe(false)
      })

      expect(useAuthorFollowStore.getState().followedIds).not.toContain('Author 2')
    })

    it('shows toast for anonymous user', async () => {
      const { toast } = await import('sonner')

      act(() => {
        useAuthorFollowStore.getState().follow('Author 2')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().followedIds).toContain('Author 2')
      })

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Faça login')
      )
    })

    it('shows toast for authenticated user', async () => {
      mockAuthState.user = { id: 'user-1', email: 'test@test.com' }
      const { toast } = await import('sonner')

      act(() => {
        useAuthorFollowStore.getState().follow('Author 2')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().followedIds).toContain('Author 2')
      })

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Seguindo')
      )
    })
  })

  describe('unfollow', () => {
    beforeEach(() => {
      act(() => {
        useAuthorFollowStore.setState({ followedIds: ['Author 1', 'Author 2'] })
      })
    })

    it('calls unfollowAuthor and removes from state on success', async () => {
      act(() => {
        useAuthorFollowStore.getState().unfollow('Author 1')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().followedIds).toEqual(['Author 2'])
      })

      expect(mockUnfollowAuthor).toHaveBeenCalledWith('Author 1', 'session-abc')
      expect(useAuthorFollowStore.getState().isLoading).toBe(false)
    })

    it('does not update state when unfollowAuthor fails', async () => {
      mockUnfollowAuthor.mockResolvedValue({ ok: false, error: { code: 'ERROR', message: 'Error' } } as any)

      act(() => {
        useAuthorFollowStore.getState().unfollow('Author 1')
      })

      await waitFor(() => {
        expect(useAuthorFollowStore.getState().isLoading).toBe(false)
      })

      expect(useAuthorFollowStore.getState().followedIds).toContain('Author 1')
    })
  })

  describe('isFollowing', () => {
    it('returns true for followed author', () => {
      act(() => {
        useAuthorFollowStore.setState({ followedIds: ['Author 1'] })
      })
      expect(useAuthorFollowStore.getState().isFollowing('Author 1')).toBe(true)
    })

    it('returns false for non-followed author', () => {
      act(() => {
        useAuthorFollowStore.setState({ followedIds: ['Author 1'] })
      })
      expect(useAuthorFollowStore.getState().isFollowing('Author 2')).toBe(false)
    })
  })
})
