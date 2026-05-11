import type { SessionCacheData } from '../types/session-library.types'

const CACHE_KEY = 'session_library_cache'
const CACHE_TTL_ONLINE = 5 * 60 * 1000
const CACHE_TTL_OFFLINE = 24 * 60 * 60 * 1000

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export function saveToCache(data: SessionCacheData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getFromCache(sessionId: string): SessionCacheData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const data: SessionCacheData = JSON.parse(raw)

    if (data.sessionId !== sessionId) {
      return null
    }

    const ttl = isOnline() ? CACHE_TTL_ONLINE : CACHE_TTL_OFFLINE
    if (Date.now() - data.timestamp > ttl) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

export function clearCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_KEY)
}
