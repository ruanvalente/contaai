import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const mockGetUser = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockMaybeSingle = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()

mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle })
mockSelect.mockReturnValue({ eq: mockEq })
mockSelect.mockReturnValue({ eq: mockEq })

const mockFrom = vi.fn()
mockFrom.mockImplementation((table: string) => {
  if (table === 'profiles') {
    return { select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) }
  }
  if (table === 'user_books') {
    return { select: () => ({ eq: () => ({ eq: () => ({ count: null }) }) }) }
  }
  return { select: mockSelect, eq: mockEq }
})

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
    onAuthStateChange: mockOnAuthStateChange,
  },
  from: mockFrom,
}

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

import { useAuthStore, useUser, useRequireAuth } from '@/shared/storage/use-auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    })
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.isInitialized).toBe(false)
  })

  it('setUser updates user state', () => {
    const testUser = { id: 'user-1', email: 'test@test.com' }
    act(() => {
      useAuthStore.getState().setUser(testUser as any)
    })
    expect(useAuthStore.getState().user).toEqual(testUser)
  })

  it('setUser sets null user', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: 'user-1', email: 'test@test.com' } as any)
    })
    act(() => {
      useAuthStore.getState().setUser(null)
    })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('clearAuth clears user and session', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: 'user-1', email: 'test@test.com' } as any)
      useAuthStore.getState().setSession({} as any)
    })
    act(() => {
      useAuthStore.getState().clearAuth()
    })
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('setSession updates session state', () => {
    const testSession = { access_token: 'token-123' }
    act(() => {
      useAuthStore.getState().setSession(testSession as any)
    })
    expect(useAuthStore.getState().session).toEqual(testSession)
  })

  it('initialize sets authenticated state when user exists', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@test.com',
      user_metadata: { full_name: 'Test User' },
    }
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockMaybeSingle.mockResolvedValue({ data: { role: 'reader' }, error: null })

    act(() => {
      useAuthStore.getState().initialize()
    })

    expect(useAuthStore.getState().isLoading).toBe(true)

    await waitFor(() => {
      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.user).toEqual({
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      avatar_url: undefined,
      role: 'reader',
    })
    expect(mockOnAuthStateChange).toHaveBeenCalled()
  })

  it('initialize sets unauthenticated state when no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    act(() => {
      useAuthStore.getState().initialize()
    })

    await waitFor(() => {
      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('initialize handles error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetUser.mockRejectedValue(new Error('Network error'))

    act(() => {
      useAuthStore.getState().initialize()
    })

    await waitFor(() => {
      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.user).toBeNull()
    consoleSpy.mockRestore()
  })

  it('initialize infers author role from user_books', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'author@test.com',
      user_metadata: { name: 'Author User' },
    }
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) }
      }
      if (table === 'user_books') {
        return { select: () => ({ eq: () => ({ eq: () => ({ count: 5 }) }) }) }
      }
      return { select: mockSelect, eq: mockEq }
    })

    act(() => {
      useAuthStore.getState().initialize()
    })

    await waitFor(() => {
      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    expect(useAuthStore.getState().user?.role).toBe('author')
  })
})

describe('useUser', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    })
  })

  it('returns user state from store', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: 'user-1', email: 'test@test.com' } as any)
      useAuthStore.setState({ isInitialized: true })
    })

    const { result } = renderHook(() => useUser())
    expect(result.current.user).toEqual({ id: 'user-1', email: 'test@test.com' })
    expect(result.current.isInitialized).toBe(true)
  })

  it('returns null user when not authenticated', () => {
    useAuthStore.setState({ isInitialized: true })
    const { result } = renderHook(() => useUser())
    expect(result.current.user).toBeNull()
  })
})

describe('useRequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    })
  })

  it('returns isAuthenticated true when user exists', () => {
    act(() => {
      useAuthStore.getState().setUser({ id: 'user-1', email: 'test@test.com' } as any)
      useAuthStore.setState({ isInitialized: true })
    })

    const { result } = renderHook(() => useRequireAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeDefined()
  })

  it('returns isAuthenticated false when no user', () => {
    useAuthStore.setState({ isInitialized: true })
    const { result } = renderHook(() => useRequireAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
