import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const mockGetUserBooksAction = vi.fn()

vi.mock('@/features/library/actions/user-books.actions', () => ({
  getUserBooksAction: (...args: any[]) => mockGetUserBooksAction(...args),
}))

import { useUserBooks, addBookToStore } from '../use-user-books'
import { useUserBooksStore, addBook } from '@/shared/store/user-books.store'
import type { UserBook } from '@/server/domain/entities/user-book.entity'

const mockBook: UserBook = {
  id: 'book-1',
  userId: 'user-1',
  title: 'Test Book',
  author: 'Test Author',
  category: 'Fantasy',
  status: 'draft',
  readingStatus: 'none',
  readingProgress: 0,
  coverColor: '#8B4513',
  wordCount: 100,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('useUserBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    act(() => {
      useUserBooksStore.setState({
        books: [],
        isLoading: false,
        isLoaded: false,
        currentFilter: 'my-stories',
      })
    })
    mockGetUserBooksAction.mockResolvedValue([mockBook])
  })

  it('starts loading on mount and fetches books', async () => {
    const { result } = renderHook(() => useUserBooks({}))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUserBooksAction).toHaveBeenCalledWith('my-stories')
  })

  it('uses activeTab to determine filter', async () => {
    renderHook(() => useUserBooks({ activeTab: 'reading' }))

    await waitFor(() => {
      expect(mockGetUserBooksAction).toHaveBeenCalledWith('reading')
    })
  })

  it('updates books in store after fetch', async () => {
    const { result } = renderHook(() => useUserBooks({}))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const state = useUserBooksStore.getState()
    expect(state.isLoaded).toBe(true)
  })

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetUserBooksAction.mockRejectedValue(new Error('Fetch error'))

    const { result } = renderHook(() => useUserBooks({}))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const state = useUserBooksStore.getState()
    expect(state.isLoaded).toBe(true)
    expect(state.books).toEqual([])
    consoleSpy.mockRestore()
  })

  it('refetch triggers fetch again', async () => {
    const { result } = renderHook(() => useUserBooks({}))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUserBooksAction).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(mockGetUserBooksAction).toHaveBeenCalledTimes(2)
    })
  })

  it('returns books from store', () => {
    mockGetUserBooksAction.mockReturnValue(new Promise(() => {}))

    act(() => {
      useUserBooksStore.getState().addBook(mockBook)
    })

    const { result } = renderHook(() => useUserBooks({}))

    expect(result.current.books).toEqual([mockBook])
  })
})

describe('addBookToStore', () => {
  beforeEach(() => {
    act(() => {
      useUserBooksStore.setState({ books: [] })
    })
  })

  it('adds a book to the store', () => {
    act(() => {
      addBookToStore(mockBook)
    })

    const state = useUserBooksStore.getState()
    expect(state.books).toEqual([mockBook])
  })

  it('prepends book to existing books', () => {
    const existing: UserBook = { ...mockBook, id: 'existing-1' }
    act(() => {
      useUserBooksStore.getState().addBook(existing)
    })
    act(() => {
      addBookToStore(mockBook)
    })

    const state = useUserBooksStore.getState()
    expect(state.books).toHaveLength(2)
    expect(state.books[0].id).toBe('book-1')
  })
})
