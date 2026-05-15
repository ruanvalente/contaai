import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFromCache, saveToCache, clearCache } from '../session-cache'
import type { SessionCacheData } from '../../types/session-library.types'

const CACHE_KEY = 'session_library_cache'
const NOW = 1_000_000_000_000

describe('session-cache', () => {
  const mockSessionId = 'test-session-123'

  function createMockData(overrides: Partial<SessionCacheData> = {}): SessionCacheData {
    return {
      favorites: [],
      authors: [],
      timestamp: NOW,
      sessionId: mockSessionId,
      ...overrides
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saveToCache stores data in localStorage', () => {
    const data = createMockData()
    saveToCache(data)
    const stored = localStorage.getItem(CACHE_KEY)
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).toEqual(data)
  })

  it('getFromCache returns valid data', () => {
    const data = createMockData()
    saveToCache(data)
    const result = getFromCache(mockSessionId)
    expect(result).toEqual(data)
  })

  it('getFromCache returns null if sessionId differs', () => {
    saveToCache(createMockData())
    const result = getFromCache('different-session')
    expect(result).toBeNull()
  })

  it('getFromCache returns null if cache expired (online, 5min TTL)', () => {
    saveToCache(createMockData({ timestamp: NOW - 6 * 60 * 1000 }))
    const result = getFromCache(mockSessionId)
    expect(result).toBeNull()
  })

  it('getFromCache returns data if within TTL', () => {
    saveToCache(createMockData({ timestamp: NOW - 4 * 60 * 1000 }))
    const result = getFromCache(mockSessionId)
    expect(result).toEqual(createMockData({ timestamp: NOW - 4 * 60 * 1000 }))
  })

  it('clearCache removes data from localStorage', () => {
    saveToCache(createMockData())
    clearCache()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it('returns null when localStorage is empty', () => {
    expect(getFromCache(mockSessionId)).toBeNull()
  })

  it('returns null for corrupted JSON data', () => {
    localStorage.setItem(CACHE_KEY, 'invalid-json')
    expect(getFromCache(mockSessionId)).toBeNull()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it('removes expired cache from localStorage', () => {
    saveToCache(createMockData({ timestamp: NOW - 10 * 60 * 1000 }))
    getFromCache(mockSessionId)
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })
})
