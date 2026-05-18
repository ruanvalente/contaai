import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCreateBookModalStore } from '../create-book-modal.store'

describe('useCreateBookModalStore', () => {
  beforeEach(() => {
    act(() => {
      useCreateBookModalStore.setState({
        isOpen: false,
        title: '',
        author: '',
        category: 'Drama',
        coverUrl: null,
        coverColor: '#8B4513',
        isUploading: false,
        isCreating: false,
        error: null,
      })
    })
  })

  it('starts closed with default values', () => {
    const state = useCreateBookModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.title).toBe('')
    expect(state.author).toBe('')
    expect(state.category).toBe('Drama')
    expect(state.coverColor).toBe('#8B4513')
    expect(state.isUploading).toBe(false)
    expect(state.isCreating).toBe(false)
    expect(state.error).toBeNull()
  })

  it('open sets isOpen to true', () => {
    act(() => {
      useCreateBookModalStore.getState().open()
    })
    expect(useCreateBookModalStore.getState().isOpen).toBe(true)
  })

  it('close resets form and sets isOpen to false', () => {
    act(() => {
      const store = useCreateBookModalStore.getState()
      store.open()
      store.setTitle('My Book')
      store.setAuthor('Author')
      store.close()
    })
    const state = useCreateBookModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.title).toBe('')
    expect(state.author).toBe('')
  })

  it('setTitle updates title', () => {
    act(() => {
      useCreateBookModalStore.getState().setTitle('New Title')
    })
    expect(useCreateBookModalStore.getState().title).toBe('New Title')
  })

  it('setAuthor updates author', () => {
    act(() => {
      useCreateBookModalStore.getState().setAuthor('New Author')
    })
    expect(useCreateBookModalStore.getState().author).toBe('New Author')
  })

  it('setCategory updates category', () => {
    act(() => {
      useCreateBookModalStore.getState().setCategory('Fantasy')
    })
    expect(useCreateBookModalStore.getState().category).toBe('Fantasy')
  })

  it('setCoverUrl updates coverUrl', () => {
    act(() => {
      useCreateBookModalStore.getState().setCoverUrl('https://example.com/cover.jpg')
    })
    expect(useCreateBookModalStore.getState().coverUrl).toBe('https://example.com/cover.jpg')
  })

  it('setCoverColor updates coverColor', () => {
    act(() => {
      useCreateBookModalStore.getState().setCoverColor('#FF0000')
    })
    expect(useCreateBookModalStore.getState().coverColor).toBe('#FF0000')
  })

  it('setUploading updates isUploading', () => {
    act(() => {
      useCreateBookModalStore.getState().setUploading(true)
    })
    expect(useCreateBookModalStore.getState().isUploading).toBe(true)
  })

  it('setCreating updates isCreating', () => {
    act(() => {
      useCreateBookModalStore.getState().setCreating(true)
    })
    expect(useCreateBookModalStore.getState().isCreating).toBe(true)
  })

  it('setError updates error', () => {
    act(() => {
      useCreateBookModalStore.getState().setError('Something went wrong')
    })
    expect(useCreateBookModalStore.getState().error).toBe('Something went wrong')
  })

  it('reset restores initial state', () => {
    act(() => {
      const store = useCreateBookModalStore.getState()
      store.open()
      store.setTitle('Title')
      store.setAuthor('Author')
      store.setCoverColor('#FF0000')
      store.reset()
    })
    const state = useCreateBookModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.title).toBe('')
    expect(state.author).toBe('')
    expect(state.coverColor).toBe('#8B4513')
  })
})
