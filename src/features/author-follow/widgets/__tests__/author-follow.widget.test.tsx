import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { mockFollow, mockUnfollow, mockStoreControl } = vi.hoisted(() => ({
  mockFollow: vi.fn(),
  mockUnfollow: vi.fn(),
  mockStoreControl: { isFollowing: false, isLoading: false },
}))

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  ),
}))

vi.mock('@/features/author-follow/hooks/use-author-follow', () => ({
  useAuthorFollowStore: Object.assign(
    (selector?: any) => {
      const store = {
        follow: mockFollow,
        unfollow: mockUnfollow,
        isFollowing: () => mockStoreControl.isFollowing,
        isLoading: mockStoreControl.isLoading,
        followedIds: [] as string[],
        isInitialized: true,
        initialize: () => Promise.resolve(),
      }
      return selector ? selector(store) : store
    },
    {
      getState: () => ({
        isLoading: mockStoreControl.isLoading,
        followedIds: [] as string[],
      }),
      setState: () => {},
      subscribe: () => () => {},
      destroy: () => {},
    }
  ),
}))

import { AuthorFollowWidget } from '../author-follow.widget'

describe('AuthorFollowWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreControl.isFollowing = false
    mockStoreControl.isLoading = false
  })

  it('renders follow button when not following', () => {
    render(<AuthorFollowWidget authorName="Author 1" authorDisplayName="Author 1" />)

    expect(screen.getByText('+ Seguir "Author 1"')).toBeDefined()
  })

  it('renders following button when following', () => {
    mockStoreControl.isFollowing = true

    render(<AuthorFollowWidget authorName="Author 1" authorDisplayName="Author 1" />)

    expect(screen.getByText(/Seguindo/)).toBeDefined()
  })

  it('calls follow on click when not following', () => {
    render(<AuthorFollowWidget authorName="Author 1" authorDisplayName="Author 1" />)

    fireEvent.click(screen.getByText('+ Seguir "Author 1"'))

    expect(mockFollow).toHaveBeenCalledWith('Author 1')
  })

  it('calls unfollow on click when following', () => {
    mockStoreControl.isFollowing = true

    render(<AuthorFollowWidget authorName="Author 1" authorDisplayName="Author 1" />)

    fireEvent.click(screen.getByText(/Seguindo/))

    expect(mockUnfollow).toHaveBeenCalledWith('Author 1')
  })

  it('passes authorDisplayName to the button', () => {
    render(<AuthorFollowWidget authorName="Author 1" authorDisplayName="Display Name" />)

    expect(screen.getByText('+ Seguir "Display Name"')).toBeDefined()
  })

  it('falls back to Autor when no display name', () => {
    render(<AuthorFollowWidget authorName="Author 1" />)

    expect(screen.getByText('+ Seguir Autor')).toBeDefined()
  })
})
