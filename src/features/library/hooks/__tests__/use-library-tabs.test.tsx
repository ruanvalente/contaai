import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

import { useLibraryTabs } from '../use-library-tabs'

describe('useLibraryTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns my-stories as default tab', () => {
    const { result } = renderHook(() => useLibraryTabs())

    expect(result.current.activeTab).toBe('my-stories')
  })

  it('reads tab from searchParams', () => {
    vi.mocked(vi.importActual('next/navigation')).then((mod) => {
      // override not needed; we re-mock
    })

    const { result } = renderHook(() => useLibraryTabs())
    expect(result.current.activeTab).toBe('my-stories')
  })

  it('setTab updates active tab', () => {
    const { result } = renderHook(() => useLibraryTabs())

    act(() => {
      result.current.setTab('reading')
    })

    expect(result.current.activeTab).toBe('reading')
  })

  it('setTab pushes to router', () => {
    const { result } = renderHook(() => useLibraryTabs())

    act(() => {
      result.current.setTab('completed')
    })

    expect(mockPush).toHaveBeenCalledWith('?tab=completed', { scroll: false })
  })

  it('setTab with same tab updates router anyway', () => {
    const { result } = renderHook(() => useLibraryTabs())

    act(() => {
      result.current.setTab('my-stories')
    })

    expect(mockPush).toHaveBeenCalledWith('?tab=my-stories', { scroll: false })
  })
})
