import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

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

const mockGetBookById = vi.fn()

vi.mock('@/features/book-dashboard/actions/user-books.actions', () => ({
  getBookById: (...args: unknown[]) => mockGetBookById(...args),
  saveBookContent: vi.fn(),
}))

type MockBackupData = {
  content: string
  timestamp: number
  title: string
}

type MockEditorBackupReturn = {
  backupData: MockBackupData | null
  hasBackup: boolean
  saveBackup: ReturnType<typeof vi.fn>
  clearBackup: ReturnType<typeof vi.fn>
  isBackupExpired: boolean
}

const mockUseEditorBackup = vi.fn()
let mockBackupState: MockEditorBackupReturn

vi.mock('@/features/editor/hooks/use-editor-backup', () => ({
  useEditorBackup: (...args: unknown[]) => mockUseEditorBackup(...args),
}))

import { useBookEditor } from '../use-book-editor'
import { useBookEditorStore } from '../../store/book-editor.store'

function createMockBackup(overrides: Partial<MockEditorBackupReturn> = {}): MockEditorBackupReturn {
  return {
    backupData: null,
    hasBackup: false,
    saveBackup: vi.fn(),
    clearBackup: vi.fn(),
    isBackupExpired: false,
    ...overrides,
  }
}

const mockBookData = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  content: 'Existing content',
  coverUrl: 'https://example.com/cover.jpg',
  coverColor: '#8B4513',
  category: 'Fantasy',
  status: 'draft' as const,
  updatedAt: new Date('2024-01-01'),
}

function configureBackupMock(backupState: MockEditorBackupReturn) {
  mockBackupState = backupState
  mockUseEditorBackup.mockReturnValue(backupState)
}

let actErrorSpy: ReturnType<typeof vi.spyOn>

describe('useBookEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockReset()
    mockGetBookById.mockReset()
    configureBackupMock(createMockBackup())
    useBookEditorStore.getState().reset()

    const originalError = console.error
    actErrorSpy = vi.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('not wrapped in act')) {
        return
      }
      originalError.call(console, msg)
    })
  })

  afterEach(() => {
    actErrorSpy.mockRestore()
  })

  it('starts in loading state', () => {
    mockGetBookById.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useBookEditor('book-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.book).toBeNull()
  })

  it('loads book successfully without backup', async () => {
    mockGetBookById.mockResolvedValue(mockBookData)

    const { result } = renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.book).not.toBeNull()
    expect(result.current.book?.title).toBe('Test Book')
    expect(result.current.book?.content).toBe('Existing content')
    expect(result.current.showRecoveryModal).toBe(false)
  })

  it('shows recovery modal when backup is newer than db content', async () => {
    const newerBackupData = {
      content: 'Backup content that is newer',
      timestamp: mockBookData.updatedAt!.getTime() + 100000,
      title: 'Test Book',
    }

    configureBackupMock(createMockBackup({
      backupData: newerBackupData,
      hasBackup: true,
    }))

    mockGetBookById.mockResolvedValue(mockBookData)

    const { result } = renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.showRecoveryModal).toBe(true)
    expect(result.current.recoveredContent).toBe('Backup content that is newer')
    expect(result.current.hasBackup).toBe(true)
  })

  it('uses backup content when database content is empty', async () => {
    const bookWithEmptyContent = {
      ...mockBookData,
      content: '',
    }

    const backupData = {
      content: 'Backup content',
      timestamp: Date.now(),
      title: 'Test Book',
    }

    configureBackupMock(createMockBackup({
      backupData,
      hasBackup: true,
      clearBackup: vi.fn(),
    }))

    mockGetBookById.mockResolvedValue(bookWithEmptyContent)

    const { result } = renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.book?.content).toBe('Backup content')
    expect(result.current.isInitialized).toBe(true)
    expect(mockBackupState.clearBackup).toHaveBeenCalled()
  })

  it('redirects to library when book is not found', async () => {
    mockGetBookById.mockResolvedValue(null)

    renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/library')
    })
  })

  it('handleBack calls router.push', () => {
    mockGetBookById.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useBookEditor('book-1'))

    act(() => {
      result.current.handleBack()
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard/library')
  })

  it('handleDiscardRecovery clears backup and closes modal', async () => {
    const clearBackupMock = vi.fn()

    configureBackupMock(createMockBackup({
      backupData: { content: 'backup', timestamp: Date.now(), title: 'Test' },
      hasBackup: true,
      clearBackup: clearBackupMock,
    }))

    mockGetBookById.mockResolvedValue(mockBookData)

    const { result } = renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handleDiscardRecovery()
    })

    expect(clearBackupMock).toHaveBeenCalled()
  })

  it('handles error when loading book fails', async () => {
    mockGetBookById.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBookEditor('book-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.book).toBeNull()
  })
})
