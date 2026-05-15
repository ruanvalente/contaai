import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const mockGetFavoritesAction = vi.fn()
const mockGetAuthorsAction = vi.fn()
const mockGetSessionId = vi.fn()
const mockGetFromCache = vi.fn()
const mockSaveToCache = vi.fn()
const mockClearCache = vi.fn()

vi.mock('@/features/discovery/hooks/use-favorites', () => ({
  useFavorites: () => ({
    favoritedIds: [],
    isLoading: false,
    isLoaded: true,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorited: () => false
  })
}))

vi.mock('@/features/author-follow/hooks/use-author-follow', () => ({
  useAuthorFollowStore: Object.assign(
    (selector?: any) => {
      const state = { followedIds: [], isLoading: false, isInitialized: true }
      return selector ? selector(state) : state
    },
    { getState: () => ({ followedIds: [], isLoading: false, isInitialized: true }) }
  )
}))

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => {
      const state = { user: null, isInitialized: true }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: null, isInitialized: true }) }
  )
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: () => mockGetSessionId()
}))

vi.mock('@/features/session-library/actions/get-session-favorites.action', () => ({
  getSessionFavoritesAction: (...args: any[]) => mockGetFavoritesAction(...args)
}))

vi.mock('@/features/session-library/actions/get-session-followed-authors.action', () => ({
  getSessionFollowedAuthorsAction: (...args: any[]) => mockGetAuthorsAction(...args)
}))

vi.mock('@/features/session-library/lib/session-cache', () => ({
  getFromCache: (...args: any[]) => mockGetFromCache(...args),
  saveToCache: (...args: any[]) => mockSaveToCache(...args),
  clearCache: (...args: any[]) => mockClearCache(...args)
}))

import { useSessionLibrary } from '../use-session-library'

describe('useSessionLibrary', () => {
  const mockFavorites = [
    {
      id: 'fav-1',
      bookId: 'book-1',
      bookTitle: 'Book 1',
      bookAuthor: 'Author 1',
      bookCoverUrl: null,
      bookCoverColor: null,
      bookCategory: null,
      favoritedAt: '2024-01-01'
    }
  ]

  const mockAuthors = [
    {
      authorName: 'Author 1',
      avatarUrl: null,
      bio: null,
      booksCount: 3,
      followedAt: '2024-01-01'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSessionId.mockReturnValue('session-abc')
    mockGetFavoritesAction.mockResolvedValue(mockFavorites)
    mockGetAuthorsAction.mockResolvedValue(mockAuthors)
    mockGetFromCache.mockReturnValue(null)
    mockSaveToCache.mockReturnValue(undefined)
  })

  it('returns initial state while loading', () => {
    mockGetFavoritesAction.mockImplementation(() => new Promise(() => {}))
    mockGetAuthorsAction.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useSessionLibrary())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.favorites).toEqual([])
    expect(result.current.authors).toEqual([])
    expect(result.current.activeTab).toBe('favorites')
  })

  it('loads favorites and authors on mount', async () => {
    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(mockGetFavoritesAction).toHaveBeenCalledWith('session-abc')
    expect(mockGetAuthorsAction).toHaveBeenCalledWith('session-abc')
    expect(result.current.favorites).toEqual(mockFavorites)
    expect(result.current.authors).toEqual(mockAuthors)
    expect(result.current.isLoading).toBe(false)
  })

  it('uses cached data before API resolves', async () => {
    mockGetFromCache.mockReturnValue({
      favorites: mockFavorites,
      authors: mockAuthors,
      timestamp: Date.now(),
      sessionId: 'session-abc'
    })
    mockGetFavoritesAction.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockFavorites), 200))
    )
    mockGetAuthorsAction.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAuthors), 200))
    )

    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.favorites).toEqual(mockFavorites)
    })
  })

  it('saves data to cache after fetch', async () => {
    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(mockSaveToCache).toHaveBeenCalledWith(
      expect.objectContaining({
        favorites: mockFavorites,
        authors: mockAuthors,
        sessionId: 'session-abc'
      })
    )
  })

  it('setActiveTab changes active tab', async () => {
    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.setActiveTab('authors')
    })

    expect(result.current.activeTab).toBe('authors')
  })

  it('isAuthenticated is false for anonymous users', async () => {
    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns counts based on data length', async () => {
    const { result } = renderHook(() => useSessionLibrary())

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.favoritesCount).toBe(1)
    expect(result.current.authorsCount).toBe(1)
  })
})
