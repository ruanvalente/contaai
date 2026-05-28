import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const mockGetAnonymousSessionId = vi.fn()
const mockGetUserFavorites = vi.fn()
const mockAddToFavoritesAction = vi.fn()
const mockRemoveFromFavoritesAction = vi.fn()
const mockSetInitialFavorites = vi.fn()
const mockAddFavoriteToStore = vi.fn()
const mockRemoveFavoriteFromStore = vi.fn()
const mockIsFavoritedFromStore = vi.fn()
const mockSetLoading = vi.fn()
let mockFavoritedIds = new Set<string>()
let mockIsLoaded = false
let mockIsLoading = false
let mockUser: any = null

vi.mock('@/shared/store/favorites.store', () => ({
  useFavoritesStore: Object.assign(
    (selector?: any) => {
      const state = {
        favoritedIds: mockFavoritedIds,
        isLoaded: mockIsLoaded,
        isLoading: mockIsLoading,
        setInitialFavorites: mockSetInitialFavorites,
        addFavorite: mockAddFavoriteToStore,
        removeFavorite: mockRemoveFavoriteFromStore,
        isFavorited: mockIsFavoritedFromStore,
        setLoading: mockSetLoading,
        setLoaded: vi.fn(),
        toggleFavorite: vi.fn(),
      }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: mockUser }) }
  )
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: (...args: any[]) => mockGetAnonymousSessionId(...args),
}))

vi.mock('@/features/discovery/actions/favorites.actions', () => ({
  getUserFavorites: (...args: any[]) => mockGetUserFavorites(...args),
  addToFavorites: (...args: any[]) => mockAddToFavoritesAction(...args),
  removeFromFavorites: (...args: any[]) => mockRemoveFromFavoritesAction(...args),
}))

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => {
      const state = { user: mockUser }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: mockUser }) }
  ),
}))

vi.mock('@/features/notifications', () => {
  const mockToast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  })
  return { toast: mockToast }
})

import { useFavorites } from '../use-favorites'

const mockBook = { id: 'book-1', title: 'Test Book', author: 'Author' }

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFavoritedIds = new Set<string>()
    mockIsLoaded = false
    mockIsLoading = false
    mockUser = null
    mockGetAnonymousSessionId.mockReturnValue('session-abc')
    mockGetUserFavorites.mockResolvedValue([])
    mockIsFavoritedFromStore.mockImplementation((id: string) => mockFavoritedIds.has(id))
    mockSetInitialFavorites.mockImplementation((ids: string[]) => {
      mockFavoritedIds = new Set(ids)
      mockIsLoaded = true
    })
    mockAddFavoriteToStore.mockImplementation((id: string) => {
      mockFavoritedIds = new Set([...mockFavoritedIds, id])
    })
    mockRemoveFavoriteFromStore.mockImplementation((id: string) => {
      const newSet = new Set(mockFavoritedIds)
      newSet.delete(id)
      mockFavoritedIds = newSet
    })
  })

  it('returns default state when not loaded', () => {
    const { result } = renderHook(() => useFavorites())

    expect(result.current.favoritedIds).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isLoaded).toBe(false)
  })

  it('loads initial favorites from server when not loaded', async () => {
    mockGetUserFavorites.mockResolvedValue([
      { bookId: 'book-1' },
      { bookId: 'book-2' },
    ])

    renderHook(() => useFavorites())

    await waitFor(() => {
      expect(mockGetAnonymousSessionId).toHaveBeenCalled()
      expect(mockGetUserFavorites).toHaveBeenCalledWith('session-abc')
      expect(mockSetInitialFavorites).toHaveBeenCalledWith(['book-1', 'book-2'])
    })
  })

  it('does not load favorites when already loaded', () => {
    mockIsLoaded = true
    mockFavoritedIds = new Set(['book-1'])

    renderHook(() => useFavorites())

    expect(mockGetUserFavorites).not.toHaveBeenCalled()
  })

  it('sets initial favorites from props when not loaded', () => {
    renderHook(() => useFavorites({ initialFavoritedIds: ['book-1', 'book-2'] }))

    expect(mockSetInitialFavorites).toHaveBeenCalledWith(['book-1', 'book-2'])
  })

  it('isFavorited returns correct value', () => {
    mockFavoritedIds = new Set(['book-1'])
    mockIsLoaded = true

    const { result } = renderHook(() => useFavorites())

    expect(result.current.isFavorited('book-1')).toBe(true)
    expect(result.current.isFavorited('book-999')).toBe(false)
  })

  it('addFavorite adds book to favorites', async () => {
    mockAddToFavoritesAction.mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useFavorites())

    await act(async () => {
      await result.current.addFavorite(mockBook as any)
    })

    expect(mockAddToFavoritesAction).toHaveBeenCalledWith('book-1', 'session-abc')
    expect(mockAddFavoriteToStore).toHaveBeenCalledWith('book-1')
  })

  it('addFavorite does not add to store when action fails', async () => {
    mockAddToFavoritesAction.mockResolvedValue({ ok: false, error: { code: 'ERROR', message: 'Error' } })

    const { result } = renderHook(() => useFavorites())

    await act(async () => {
      await result.current.addFavorite(mockBook as any)
    })

    expect(mockAddFavoriteToStore).not.toHaveBeenCalled()
  })

  it('removeFavorite removes book from favorites', async () => {
    mockRemoveFromFavoritesAction.mockResolvedValue({ ok: true })
    mockFavoritedIds = new Set(['book-1'])

    const { result } = renderHook(() => useFavorites())

    await act(async () => {
      await result.current.removeFavorite('book-1')
    })

    expect(mockRemoveFromFavoritesAction).toHaveBeenCalledWith('book-1', 'session-abc')
    expect(mockRemoveFavoriteFromStore).toHaveBeenCalledWith('book-1')
  })

  it('toggleFavorite removes when already favorited', async () => {
    mockIsFavoritedFromStore.mockReturnValue(true)
    mockRemoveFromFavoritesAction.mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useFavorites())

    await act(async () => {
      await result.current.toggleFavorite(mockBook as any)
    })

    expect(mockRemoveFromFavoritesAction).toHaveBeenCalled()
    expect(mockAddToFavoritesAction).not.toHaveBeenCalled()
  })

  it('toggleFavorite adds when not favorited', async () => {
    mockIsFavoritedFromStore.mockReturnValue(false)
    mockAddToFavoritesAction.mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useFavorites())

    await act(async () => {
      await result.current.toggleFavorite(mockBook as any)
    })

    expect(mockAddToFavoritesAction).toHaveBeenCalled()
    expect(mockRemoveFromFavoritesAction).not.toHaveBeenCalled()
  })
})
