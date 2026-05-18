import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { Book } from '@/server/domain/entities/book.entity'

const mockBooks: Book[] = [
  {
    id: '1', title: 'Dune', author: 'Frank Herbert',
    coverColor: '#8B4513', category: 'Sci-Fi', description: '',
    pages: 412, rating: 4.5, ratingCount: 100, reviewCount: 50,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2', title: 'Harry Potter', author: 'J.K. Rowling',
    coverColor: '#2E4A62', category: 'Fantasy', description: '',
    pages: 300, rating: 4.8, ratingCount: 200, reviewCount: 100,
    createdAt: new Date('2023-02-01'),
  },
  {
    id: '3', title: 'Clean Code', author: 'Robert Martin',
    coverColor: '#4A2E4A', category: 'Education', description: '',
    pages: 464, rating: 4.2, ratingCount: 50, reviewCount: 25,
    createdAt: new Date('2023-03-01'),
  },
]

const mockGetBooksAction = vi.fn()

vi.mock('@/features/discovery/actions/books.actions', () => ({
  getBooksAction: (...args: any[]) => mockGetBooksAction(...args),
}))

import { useBooks } from '../use-books'

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBooksAction.mockResolvedValue(mockBooks)
  })

  it('returns initialBooks when provided', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    expect(result.current.books).toEqual(mockBooks)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches books when no initialBooks provided', async () => {
    const { result } = renderHook(() => useBooks())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.books).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.books).toEqual(mockBooks)
    expect(mockGetBooksAction).toHaveBeenCalledOnce()
  })

  it('does not fetch when initialBooks provided', () => {
    renderHook(() => useBooks(mockBooks))

    expect(mockGetBooksAction).not.toHaveBeenCalled()
  })

  it('sets error when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetBooksAction.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
    expect(result.current.books).toEqual([])

    consoleSpy.mockRestore()
  })

  it('filteredBooks returns all books for "All" category', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('All')
    expect(filtered).toEqual(mockBooks)
  })

  it('filteredBooks filters by category', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('Sci-Fi')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('1')
  })

  it('filteredBooks searches by title', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('All', 'Dune')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('1')
  })

  it('filteredBooks searches by author', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('All', 'Rowling')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('2')
  })

  it('filteredBooks combines category and search', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('Drama', 'Dune')
    expect(filtered).toHaveLength(0)
  })

  it('filteredBooks is case-insensitive', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('All', 'dune')
    expect(filtered).toHaveLength(1)
  })

  it('search returns empty for non-matching query', () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    const filtered = result.current.filteredBooks('All', 'NonExistent')
    expect(filtered).toHaveLength(0)
  })

  it('refetch re-fetches books', async () => {
    const { result } = renderHook(() => useBooks(mockBooks))

    expect(mockGetBooksAction).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockGetBooksAction).toHaveBeenCalledOnce()
    expect(result.current.books).toEqual(mockBooks)
  })
})
