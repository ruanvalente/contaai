import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockGetState = vi.hoisted(() => vi.fn())
const mockSaveBackup = vi.hoisted(() => vi.fn())
const mockStoreState = vi.hoisted(() => ({ content: '', isDirty: false }))

vi.mock('@/features/book-dashboard/store/book-editor.store', () => ({
  useBookEditorStore: Object.assign(
    (selector: (state: { content: string; isDirty: boolean }) => unknown) => {
      const state = { ...mockStoreState }
      return selector ? selector(state) : state
    },
    { getState: mockGetState }
  ),
}))

vi.mock('@/features/book-dashboard/hooks/use-editor-backup', () => ({
  useEditorBackup: () => ({
    saveBackup: mockSaveBackup,
    clearBackup: vi.fn(),
    hasBackup: false,
    backupData: null,
    isBackupExpired: false,
  }),
}))

import { useEditorBackupInterval } from '../use-editor-backup-interval'

describe('useEditorBackupInterval', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockStoreState.content = ''
    mockStoreState.isDirty = false
    mockGetState.mockImplementation(() => mockStoreState)
    mockSaveBackup.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not set up interval when bookId is empty', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() =>
      useEditorBackupInterval('', true)
    )

    unmount()

    expect(clearIntervalSpy).not.toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('does not set up interval when not initialized', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    renderHook(() => useEditorBackupInterval('book-1', false))

    expect(setIntervalSpy).not.toHaveBeenCalled()
    setIntervalSpy.mockRestore()
  })

  it('sets up 5-second interval when initialized', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    renderHook(() => useEditorBackupInterval('book-1', true))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
    setIntervalSpy.mockRestore()
  })

  it('saves backup when content changes', () => {
    mockStoreState.content = 'initial content'
    mockStoreState.isDirty = true

    renderHook(() => useEditorBackupInterval('book-1', true))

    mockStoreState.content = 'updated content'
    mockGetState.mockImplementation(() => mockStoreState)

    vi.advanceTimersByTime(5000)

    expect(mockSaveBackup).toHaveBeenCalledWith('updated content', undefined)
  })

  it('does not save backup when content is unchanged', () => {
    mockStoreState.content = 'same content'
    mockStoreState.isDirty = true

    renderHook(() => useEditorBackupInterval('book-1', true))

    vi.advanceTimersByTime(5000)
    mockSaveBackup.mockClear()

    vi.advanceTimersByTime(5000)

    expect(mockSaveBackup).not.toHaveBeenCalled()
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() =>
      useEditorBackupInterval('book-1', true)
    )

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('registers beforeunload listener when dirty', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    mockStoreState.content = 'dirty content'
    mockStoreState.isDirty = true

    renderHook(() => useEditorBackupInterval('book-1', true))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
    addEventListenerSpy.mockRestore()
  })

  it('removes beforeunload listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    mockStoreState.content = 'dirty content'
    mockStoreState.isDirty = true

    const { unmount } = renderHook(() =>
      useEditorBackupInterval('book-1', true)
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
    removeEventListenerSpy.mockRestore()
  })
})
