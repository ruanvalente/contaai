import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

function cleanProps(props: Record<string, any>) {
  const cleaned: Record<string, any> = {}
  for (const key of Object.keys(props)) {
    if (!key.startsWith('while') && !key.startsWith('animate') && !key.startsWith('initial') && !key.startsWith('exit') && !key.startsWith('transition') && key !== 'layout') {
      cleaned[key] = props[key]
    }
  }
  return cleaned
}

vi.mock('framer-motion', () => {
  const MockDiv = React.forwardRef((props: any, ref: any) =>
    React.createElement('div', { ...cleanProps(props), ref })
  )
  MockDiv.displayName = 'MockDiv'

  const MockButton = React.forwardRef((props: any, ref: any) =>
    React.createElement('button', { ...cleanProps(props), ref })
  )
  MockButton.displayName = 'MockButton'

  return {
    motion: {
      div: MockDiv,
      span: MockDiv,
      button: MockButton,
      section: MockDiv,
      p: MockDiv,
      h1: MockDiv, h2: MockDiv, h3: MockDiv,
      img: MockDiv,
    },
    AnimatePresence: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
  }
})

vi.mock('next/image', () => ({
  default: (props: any) => {
    const { fill, ...rest } = props
    return React.createElement('img', rest)
  },
}))

vi.mock('lucide-react', () => {
  const Icon = (props: any) =>
    React.createElement('svg', { 'data-testid': 'lucide-icon', ...props })

  return {
    Star: ({ className, fill, ...rest }: any) =>
      React.createElement('svg', { 'data-testid': 'star', className, fill, ...rest }),
    Heart: (props: any) => React.createElement('svg', { 'data-testid': 'heart', ...props }),
    BookOpen: (props: any) => React.createElement('svg', { 'data-testid': 'book-open', ...props }),
    Users: (props: any) => React.createElement('svg', { 'data-testid': 'users', ...props }),
    MessageCircle: (props: any) => React.createElement('svg', { 'data-testid': 'message-circle', ...props }),
    Menu: Icon,
    X: Icon,
    Search: Icon,
    Filter: Icon,
    ChevronLeft: Icon,
    ChevronRight: Icon,
    UserPlus: Icon,
  }
})

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) =>
    React.createElement('button', { onClick, disabled, type, className }, children),
}))

const mockToggleFavorite = vi.fn()
const mockIsFavorited = vi.fn()
const mockFollow = vi.fn()
const mockUnfollow = vi.fn()
const mockIsFollowing = vi.fn()
const mockPush = vi.fn()
const mockGetAnonymousSessionId = vi.fn()

const mockFavState = { isFavorited: mockIsFavorited, isLoading: false, toggleFavorite: mockToggleFavorite }
const mockFollowState = { follow: mockFollow, unfollow: mockUnfollow, isFollowing: mockIsFollowing, isLoading: false, followedIds: [], isInitialized: true, initialize: vi.fn() }

vi.mock('@/features/discovery/hooks/use-favorites', () => ({
  useFavorites: () => mockFavState,
}))

vi.mock('@/features/author-follow/hooks/use-author-follow', () => ({
  useAuthorFollowStore: Object.assign(
    (selector?: any) => selector ? selector(mockFollowState) : mockFollowState,
    { getState: () => ({ isLoading: false }), setState: () => {}, subscribe: () => () => {}, destroy: () => {} }
  ),
}))

vi.mock('@/features/author-follow/hooks/use-author-follow-initialized', () => ({
  useAuthorFollowInitialized: () => {},
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: () => mockGetAnonymousSessionId(),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/features/notifications', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => selector ? selector({ user: null, isInitialized: true }) : { user: null, isInitialized: true },
    { getState: () => ({ user: null }) }
  ),
}))

vi.mock('@/features/book-details/actions/rate-book.action', () => ({
  getUserRating: vi.fn().mockResolvedValue(null),
  rateBook: vi.fn().mockResolvedValue({ success: true, newRating: 4, ratingCount: 10 }),
}))

import { BookDetailsPanelWidget } from '../book-details-panel.widget'
import type { Book } from '@/server/domain/entities/book.entity'

const mockBook: Book = {
  id: 'book-1',
  title: 'Test Book Title',
  author: 'Test Author',
  coverColor: '#8B4513',
  category: 'Fantasy',
  description: 'A test book description',
  pages: 200,
  rating: 4.5,
  ratingCount: 10,
  reviewCount: 5,
  createdAt: new Date('2024-01-01'),
}

describe('BookDetailsPanelWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsFavorited.mockReturnValue(false)
    mockIsFollowing.mockReturnValue(false)
    mockGetAnonymousSessionId.mockReturnValue('session-abc')
  })

  it('renders skeleton when isLoading', () => {
    const { container } = render(<BookDetailsPanelWidget book={null} isLoading />)
    expect(container.querySelector('.animate-pulse')).toBeDefined()
  })

  it('renders empty state when book is null', () => {
    render(<BookDetailsPanelWidget book={null} />)
    expect(screen.getByText('Selecione um Livro')).toBeDefined()
  })

  it('renders book details', () => {
    render(<BookDetailsPanelWidget book={mockBook} />)
    const titles = screen.getAllByText('Test Book Title')
    expect(titles.length).toBe(2)
    expect(screen.getByText('Test Author')).toBeDefined()
    expect(screen.getByText('Fantasy')).toBeDefined()
    expect(screen.getByText('200')).toBeDefined()
  })

  it('shows correct rating displayValue', () => {
    render(<BookDetailsPanelWidget book={mockBook} />)
    expect(screen.getByText('4.5 / 5')).toBeDefined()
  })

  it('renders Read Now button with follow text when not following author', () => {
    mockIsFollowing.mockReturnValue(false)
    render(<BookDetailsPanelWidget book={mockBook} />)
    expect(screen.getByText('Ler Agora + Seguir Test Author')).toBeDefined()
  })

  it('renders Read Now button without follow text when already following', () => {
    mockIsFollowing.mockReturnValue(true)
    render(<BookDetailsPanelWidget book={mockBook} />)
    expect(screen.getByText('Ler Agora')).toBeDefined()
  })
})
