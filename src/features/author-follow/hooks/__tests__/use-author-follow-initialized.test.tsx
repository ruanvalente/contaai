import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockApi = {
  initialize: vi.fn(),
  isInitialized: false,
}

vi.mock('../use-author-follow', () => ({
  useAuthorFollowStore: Object.assign(
    (selector?: any) => selector ? selector(mockApi) : mockApi,
    { getState: () => mockApi }
  ),
}))

import { useAuthorFollowInitialized } from '../use-author-follow-initialized'

describe('useAuthorFollowInitialized', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.initialize = vi.fn()
    mockApi.isInitialized = false
  })

  it('calls initialize when not initialized', () => {
    renderHook(() => useAuthorFollowInitialized())

    expect(mockApi.initialize).toHaveBeenCalledTimes(1)
  })

  it('does not call initialize when already initialized', () => {
    mockApi.isInitialized = true

    renderHook(() => useAuthorFollowInitialized())

    expect(mockApi.initialize).not.toHaveBeenCalled()
  })

  it('returns isInitialized state', () => {
    const { result } = renderHook(() => useAuthorFollowInitialized())

    expect(result.current).toBe(false)
  })
})
