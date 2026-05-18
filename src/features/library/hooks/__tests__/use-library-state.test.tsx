import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
}))

import { useLibraryState } from '../use-library-state'

describe('useLibraryState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSearchParams.set('tab', 'my-stories')
    mockSearchParams.delete('published')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with null publishedBookId and deletingId', () => {
    const { result } = renderHook(() => useLibraryState())

    expect(result.current.publishedBookId).toBeNull()
    expect(result.current.deletingId).toBeNull()
  })

  it('reads publishedBookId from searchParams', () => {
    mockSearchParams.set('published', 'book-123')

    const { result } = renderHook(() => useLibraryState())

    expect(result.current.publishedBookId).toBe('book-123')
  })

  it('setDeletingId updates deletingId', () => {
    const { result } = renderHook(() => useLibraryState())

    act(() => {
      result.current.setDeletingId('book-1')
    })

    expect(result.current.deletingId).toBe('book-1')
  })

  it('setDeletingId clears deletingId', () => {
    const { result } = renderHook(() => useLibraryState())

    act(() => {
      result.current.setDeletingId('book-1')
    })
    act(() => {
      result.current.setDeletingId(null)
    })

    expect(result.current.deletingId).toBeNull()
  })

  it('clearPublished sets publishedBookId to null', () => {
    mockSearchParams.set('published', 'book-123')
    const { result } = renderHook(() => useLibraryState())

    expect(result.current.publishedBookId).toBe('book-123')

    act(() => {
      result.current.clearPublished()
    })

    expect(result.current.publishedBookId).toBeNull()
  })

  it('auto-clears publishedBookId after 3 seconds and calls replace', () => {
    mockSearchParams.set('published', 'book-123')
    const { result } = renderHook(() => useLibraryState())

    expect(result.current.publishedBookId).toBe('book-123')

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.publishedBookId).toBeNull()
    expect(mockReplace).toHaveBeenCalledWith('?tab=my-stories', { scroll: false })
  })

  it('does not set timer when publishedBookId is null', () => {
    renderHook(() => useLibraryState())

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockReplace).not.toHaveBeenCalled()
  })
})
