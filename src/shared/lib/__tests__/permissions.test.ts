import { describe, it, expect } from 'vitest'
import { can, isLazyAction, getAnonymousToastMessage } from '../permissions'

describe('permissions', () => {
  describe('can function', () => {
    it('anonymous can view:books', () => {
      expect(can('anonymous', 'view:books')).toBe(true)
    })

    it('anonymous can view:session', () => {
      expect(can('anonymous', 'view:session')).toBe(true)
    })

    it('anonymous CANNOT library:personal', () => {
      expect(can('anonymous', 'library:personal')).toBe(false)
    })

    it('reader can library:personal', () => {
      expect(can('reader', 'library:personal')).toBe(true)
    })

    it('author can create:book', () => {
      expect(can('author', 'create:book')).toBe(true)
    })

    it('author can edit:book', () => {
      expect(can('author', 'edit:book')).toBe(true)
    })

    it('reader CANNOT create:book', () => {
      expect(can('reader', 'create:book')).toBe(false)
    })
  })

  describe('isLazyAction', () => {
    it('follow:author is lazy', () => {
      expect(isLazyAction('follow:author')).toBe(true)
    })

    it('rate:book is lazy', () => {
      expect(isLazyAction('rate:book')).toBe(true)
    })

    it('favorite:book is lazy', () => {
      expect(isLazyAction('favorite:book')).toBe(true)
    })

    it('view:books is NOT lazy', () => {
      expect(isLazyAction('view:books')).toBe(false)
    })
  })

  describe('getAnonymousToastMessage', () => {
    it('returns message for favorite:book', () => {
      const message = getAnonymousToastMessage('favorite:book')
      expect(message).toContain('favoritado')
    })

    it('returns message for follow:author', () => {
      const message = getAnonymousToastMessage('follow:author')
      expect(message).toContain('seguindo')
    })

    it('returns message for rate:book', () => {
      const message = getAnonymousToastMessage('rate:book')
      expect(message).toContain('Avaliação')
    })

    it('returns default message for unknown action', () => {
      const message = getAnonymousToastMessage('create:book' as any)
      expect(message).toContain('Faça login')
    })
  })
})
