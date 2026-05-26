import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('lucide-react', () => ({
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}))

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, onClick, variant: _variant, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

const mockHandleBack = vi.fn()
const mockHandlePublish = vi.fn()
const mockHandleRecoverContent = vi.fn()
const mockHandleDiscardRecovery = vi.fn()
const mockUseBookEditor = vi.fn()
const mockUseEditorPublish = vi.fn()
const mockUseEditorBackupInterval = vi.fn()

vi.mock('../../hooks/use-book-editor', () => ({
  useBookEditor: (...args: unknown[]) => mockUseBookEditor(...args),
}))

vi.mock('../../hooks/use-editor-publish', () => ({
  useEditorPublish: (...args: unknown[]) => mockUseEditorPublish(...args),
}))

vi.mock('../../hooks/use-editor-backup-interval', () => ({
  useEditorBackupInterval: (...args: unknown[]) => mockUseEditorBackupInterval(...args),
}))

vi.mock('../../store/book-editor.store', () => ({
  useBookEditorStore: (selector: (state: unknown) => unknown) =>
    selector({ isSaving: false, lastSaved: null, isDirty: false, content: '' }),
}))

import { BookEditor } from '../book-editor.widget'

describe('BookEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHandleBack.mockReset()
    mockHandlePublish.mockReset()
    mockHandleRecoverContent.mockReset()
    mockHandleDiscardRecovery.mockReset()
    mockUseEditorBackupInterval.mockReturnValue(undefined)
    mockUseEditorPublish.mockReturnValue({
      isPublishing: false,
      publishError: null,
      handlePublish: mockHandlePublish,
    })
  })

  it('shows loading spinner while book is loading', () => {
    mockUseBookEditor.mockReturnValue({
      book: null,
      loading: true,
      isInitialized: false,
      showRecoveryModal: false,
      recoveredContent: null,
      hasBackup: false,
      backupData: null,
      handleRecoverContent: mockHandleRecoverContent,
      handleDiscardRecovery: mockHandleDiscardRecovery,
      handleBack: mockHandleBack,
    })

    render(<BookEditor bookId="book-1" />)

    expect(screen.getByTestId('loader-icon')).toBeDefined()
  })

  it('shows error message when book is not found', () => {
    mockUseBookEditor.mockReturnValue({
      book: null,
      loading: false,
      isInitialized: false,
      showRecoveryModal: false,
      recoveredContent: null,
      hasBackup: false,
      backupData: null,
      handleRecoverContent: mockHandleRecoverContent,
      handleDiscardRecovery: mockHandleDiscardRecovery,
      handleBack: mockHandleBack,
    })

    render(<BookEditor bookId="book-1" />)

    expect(screen.getByText('Livro não encontrado')).toBeDefined()
    expect(screen.getByText('Voltar à Biblioteca')).toBeDefined()
  })

  it('calls handleBack when clicking back button in error state', () => {
    mockUseBookEditor.mockReturnValue({
      book: null,
      loading: false,
      isInitialized: false,
      showRecoveryModal: false,
      recoveredContent: null,
      hasBackup: false,
      backupData: null,
      handleRecoverContent: mockHandleRecoverContent,
      handleDiscardRecovery: mockHandleDiscardRecovery,
      handleBack: mockHandleBack,
    })

    render(<BookEditor bookId="book-1" />)

    screen.getByText('Voltar à Biblioteca').click()
    expect(mockHandleBack).toHaveBeenCalled()
  })


})
