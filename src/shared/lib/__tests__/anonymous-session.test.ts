import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getAnonymousSessionId } from '../anonymous-session'

const SESSION_KEY = 'anonymous_session_id'

describe('anonymous-session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('generates a session ID when none exists', () => {
    const sessionId = getAnonymousSessionId()

    expect(sessionId).toBeTruthy()
    expect(sessionId.startsWith('anonymous-')).toBe(true)
  })

  it('persists session ID in localStorage', () => {
    const sessionId = getAnonymousSessionId()
    const stored = localStorage.getItem(SESSION_KEY)

    expect(stored).toBe(sessionId)
  })

  it('returns the same session ID on subsequent calls', () => {
    const firstCall = getAnonymousSessionId()
    const secondCall = getAnonymousSessionId()

    expect(secondCall).toBe(firstCall)
  })

  it('returns existing session ID from localStorage', () => {
    localStorage.setItem(SESSION_KEY, 'anonymous-existing-id')

    const sessionId = getAnonymousSessionId()

    expect(sessionId).toBe('anonymous-existing-id')
  })

  it('generates unique session IDs on different stores', () => {
    const id1 = getAnonymousSessionId()

    localStorage.clear()

    const id2 = getAnonymousSessionId()

    expect(id1).not.toBe(id2)
  })
})
