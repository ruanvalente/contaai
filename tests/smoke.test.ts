import { describe, it, expect } from 'vitest'

describe('test infrastructure', () => {
  it('vitest is configured correctly', () => {
    expect(true).toBe(true)
  })

  it('jsdom environment works', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  it('globals are available', () => {
    expect(typeof globalThis).toBe('object')
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })
})
