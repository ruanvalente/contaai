import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockToast = vi.hoisted(() => Object.assign(vi.fn(), {
  error: vi.fn(),
  success: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
  promise: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: mockToast }))

const mockUseLibraryTabs = vi.fn()
const mockUseUserBooks = vi.fn()
const mockUseLibraryState = vi.fn()
const mockDeleteUserBook = vi.fn()
const mockSetTab = vi.fn()

vi.mock('@/features/library/hooks/use-library-tabs', () => ({
  useLibraryTabs: (...args: any[]) => mockUseLibraryTabs(...args),
}))

vi.mock('@/features/library/hooks/use-user-books', () => ({
  useUserBooks: (...args: any[]) => mockUseUserBooks(...args),
}))

vi.mock('@/features/library/hooks/use-library-state', () => ({
  useLibraryState: (...args: any[]) => mockUseLibraryState(...args),
}))

vi.mock('@/features/book-dashboard/actions/user-books.actions', () => ({
  deleteUserBook: (...args: any[]) => mockDeleteUserBook(...args),
}))

vi.mock('@/shared/ui/container.ui', () => ({
  Container: ({ children }: any) => <div data-testid="container">{children}</div>,
}))

vi.mock('@/shared/ui/skeleton.ui', () => ({
  BookListSkeleton: () => <div data-testid="book-list-skeleton">Carregando...</div>,
}))

vi.mock('@/shared/ui/library-header.ui', () => ({
  LibraryHeader: ({ onCreateClick }: any) => (
    <div data-testid="library-header">
      <button data-testid="create-book-btn" onClick={onCreateClick}>
        + Nova História
      </button>
    </div>
  ),
}))

vi.mock('@/shared/ui/published-notification.ui', () => ({
  PublishedNotification: ({ bookId }: any) => (
    <div data-testid="published-notification">{bookId}</div>
  ),
}))

vi.mock('@/shared/ui/empty-library-state.ui', () => ({
  EmptyLibraryState: ({ tab, onCreateClick }: any) => (
    <div data-testid="empty-state">
      empty {tab}
      <button data-testid="empty-create-btn" onClick={onCreateClick}>
        Criar Primeira História
      </button>
    </div>
  ),
}))

vi.mock('@/shared/widgets/library-tab-bar.widget', () => ({
  LibraryTabBar: ({ activeTab, onTabChange }: any) => (
    <div data-testid="tab-bar">{activeTab}</div>
  ),
}))

vi.mock('@/shared/widgets/book-card.widget', () => ({
  BookCard: ({ book, tab, isDeleting, onDeleteClick }: any) => (
    <div data-testid="book-card">
      <span>{book.title}</span>
      <button
        data-testid="delete-btn"
        onClick={() => onDeleteClick(book)}
      >
        Excluir
      </button>
    </div>
  ),
}))

vi.mock('../create-book-modal.widget', () => ({
  CreateBookModal: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? <div data-testid="create-modal">create modal</div> : null,
}))

import { LibraryContent } from '../library-content.widget'
import type { UserBook } from '@/server/domain/entities/user-book.entity'

const mockBook: UserBook = {
  id: 'book-1',
  userId: 'user-1',
  title: 'Test Book',
  author: 'Test Author',
  category: 'Fantasy',
  status: 'draft',
  readingStatus: 'none',
  readingProgress: 0,
  coverColor: '#8B4513',
  wordCount: 1000,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('LibraryContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLibraryTabs.mockReturnValue({
      activeTab: 'my-stories',
      setTab: mockSetTab,
    })
    mockUseUserBooks.mockReturnValue({
      books: [],
      loading: false,
      refetch: vi.fn(),
    })
    mockUseLibraryState.mockReturnValue({
      publishedBookId: null,
      deletingId: null,
      setDeletingId: vi.fn(),
      clearPublished: vi.fn(),
    })
    mockDeleteUserBook.mockResolvedValue({ success: true })
  })

  it('renders header and tab bar', () => {
    render(<LibraryContent />)
    expect(screen.getByTestId('library-header')).toBeDefined()
    expect(screen.getByTestId('tab-bar')).toBeDefined()
  })

  it('passes activeTab to tab bar', () => {
    render(<LibraryContent />)
    expect(screen.getByTestId('tab-bar')).toHaveTextContent('my-stories')
  })

  it('shows loading skeleton when loading', () => {
    mockUseUserBooks.mockReturnValue({
      books: [],
      loading: true,
      refetch: vi.fn(),
    })
    render(<LibraryContent />)
    expect(screen.getByTestId('book-list-skeleton')).toBeDefined()
  })

  it('shows empty state when no books', () => {
    render(<LibraryContent />)
    expect(screen.getByTestId('empty-state')).toHaveTextContent('empty my-stories')
  })

  it('renders book cards when books exist', () => {
    mockUseUserBooks.mockReturnValue({
      books: [mockBook],
      loading: false,
      refetch: vi.fn(),
    })
    render(<LibraryContent />)
    expect(screen.getByText('Test Book')).toBeDefined()
  })

  it('opens create modal on header button click', async () => {
    const user = userEvent.setup()
    render(<LibraryContent />)

    expect(screen.queryByTestId('create-modal')).toBeNull()

    await user.click(screen.getByTestId('create-book-btn'))

    expect(screen.getByTestId('create-modal')).toBeDefined()
  })

  it('opens create modal on empty state button click', async () => {
    mockUseUserBooks.mockReturnValue({
      books: [],
      loading: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup()
    render(<LibraryContent />)

    await user.click(screen.getByTestId('empty-create-btn'))

    expect(screen.getByTestId('create-modal')).toBeDefined()
  })

  it('renders published notification when publishedBookId is set', () => {
    mockUseLibraryState.mockReturnValue({
      publishedBookId: 'published-123',
      deletingId: null,
      setDeletingId: vi.fn(),
      clearPublished: vi.fn(),
    })
    render(<LibraryContent />)
    expect(screen.getByTestId('published-notification')).toHaveTextContent('published-123')
  })

  it('does not render published notification when null', () => {
    render(<LibraryContent />)
    expect(screen.queryByTestId('published-notification')).toBeNull()
  })

  it('calls toast.error on delete', async () => {
    const user = userEvent.setup()
    mockUseUserBooks.mockReturnValue({
      books: [mockBook],
      loading: false,
      refetch: vi.fn(),
    })
    render(<LibraryContent />)

    await user.click(screen.getByTestId('delete-btn'))

    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Test Book'),
      expect.any(Object)
    )
  })
})
