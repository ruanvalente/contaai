import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSignInWithEmail = vi.fn()
const mockMigrateSessionDataAction = vi.fn()
const mockGetAnonymousSessionId = vi.fn()
const mockGetPendingAction = vi.fn()
const mockClearPendingAction = vi.fn()
const mockGetPendingActions = vi.fn()
const mockClearPendingActions = vi.fn()
const mockFollowAuthor = vi.fn()
const mockAddToFavorites = vi.fn()
const mockRateBook = vi.fn()
const mockRouterPush = vi.fn()
const mockRouterRefresh = vi.fn()
const mockSearchParamsGet = vi.fn()

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, ...props }: any) => {
    const { className, ...rest } = props
    return <button {...rest}>{children}</button>
  }
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: any[]) => mockRouterPush(...args),
    refresh: (...args: any[]) => mockRouterRefresh(...args),
  }),
  useSearchParams: () => ({
    get: (...args: any[]) => mockSearchParamsGet(...args),
  })
}))

vi.mock('@/features/notifications', () => {
  const mockToast = Object.assign(
    vi.fn(),
    {
      loading: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      dismiss: vi.fn(),
      promise: vi.fn(),
    }
  )
  return {
    toast: mockToast,
    useActionToast: () => ({
      withToast: vi.fn().mockImplementation(async (promise) => promise),
      withConfirm: vi.fn(),
      showPromise: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    })
  }
})

vi.mock('@/features/auth/actions/auth.actions', () => ({
  signInWithEmail: (...args: any[]) => mockSignInWithEmail(...args),
}))

vi.mock('@/shared/hooks/use-auth-redirect', () => ({
  getPendingAction: (...args: any[]) => mockGetPendingAction(...args),
  clearPendingAction: (...args: any[]) => mockClearPendingAction(...args),
}))

vi.mock('@/shared/lib/anonymous-persistence', () => ({
  getPendingActions: (...args: any[]) => mockGetPendingActions(...args),
  clearPendingActions: (...args: any[]) => mockClearPendingActions(...args),
}))

vi.mock('@/features/auth/actions/migrate-session-data.action', () => ({
  migrateSessionDataAction: (...args: any[]) => mockMigrateSessionDataAction(...args),
}))

vi.mock('@/shared/lib/anonymous-session', () => ({
  getAnonymousSessionId: (...args: any[]) => mockGetAnonymousSessionId(...args),
}))

vi.mock('@/features/author-follow/actions/author-follow.actions', () => ({
  followAuthor: (...args: any[]) => mockFollowAuthor(...args),
}))

vi.mock('@/features/discovery/actions/favorites.actions', () => ({
  addToFavorites: (...args: any[]) => mockAddToFavorites(...args),
}))

vi.mock('@/features/book-details/actions/rate-book.action', () => ({
  rateBook: (...args: any[]) => mockRateBook(...args),
}))

vi.mock('lucide-react', () => ({
  Book: () => <svg data-testid="book-icon" />,
}))

vi.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      button: React.forwardRef((props: any, ref: any) => React.createElement('button', { ...props, ref })),
      div: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
      span: React.forwardRef((props: any, ref: any) => React.createElement('span', { ...props, ref })),
      p: React.forwardRef((props: any, ref: any) => React.createElement('p', { ...props, ref })),
      h1: React.forwardRef((props: any, ref: any) => React.createElement('h1', { ...props, ref })),
    },
    AnimatePresence: ({ children }: any) => {
      const React = require('react')
      return React.createElement(React.Fragment, null, children)
    },
  }
})

import { LoginFormWidget } from '../login-form.widget'

describe('LoginFormWidget', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithEmail.mockResolvedValue({ ok: true, data: { user: { id: 'user-1', email: 'test@test.com' } } })
    mockMigrateSessionDataAction.mockResolvedValue({
      success: true,
      migrated: { follows: 0, ratings: 0, favorites: 0 },
    })
    mockGetAnonymousSessionId.mockReturnValue('session-abc')
    mockGetPendingAction.mockReturnValue(null)
    mockGetPendingActions.mockReturnValue([])
    mockSearchParamsGet.mockReturnValue(null)
  })

  it('renders the login form with all elements', () => {
    render(<LoginFormWidget />)

    expect(screen.getByText('Bem-vindo de volta')).toBeDefined()
    expect(screen.getByText('Entre para acessar sua biblioteca')).toBeDefined()
    expect(screen.getByLabelText('E-mail')).toBeDefined()
    expect(screen.getByLabelText('Senha')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDefined()
    expect(screen.getByText('Esqueceu a senha?')).toBeDefined()
    expect(screen.getByText('Cadastre-se')).toBeDefined()
  })

  it('shows error message when signIn fails', async () => {
    mockSignInWithEmail.mockResolvedValue({ ok: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos' } })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'wrong@test.com')
    await user.type(screen.getByLabelText('Senha'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos')).toBeDefined()
    })
  })

  it('calls router.push with default redirect on successful login', async () => {
    mockSearchParamsGet.mockReturnValue(null)

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@test.com', 'correctpass')
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard')
    })
    expect(mockRouterRefresh).toHaveBeenCalled()
  })

  it('redirects to custom path when redirect param is present', async () => {
    mockSearchParamsGet.mockImplementation((param: string) => {
      if (param === 'redirect') return '/explore'
      return null
    })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/explore')
    })
  })

  it('syncs anonymous data on successful login', async () => {
    mockMigrateSessionDataAction.mockResolvedValue({
      success: true,
      migrated: { follows: 2, ratings: 1, favorites: 3 },
    })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockGetAnonymousSessionId).toHaveBeenCalled()
      expect(mockMigrateSessionDataAction).toHaveBeenCalledWith('session-abc')
    })
  })

  it('shows sync message when migration has items', async () => {
    mockMigrateSessionDataAction.mockResolvedValue({
      success: true,
      migrated: { follows: 2, ratings: 1, favorites: 3 },
    })

    const { toast } = await import('@/features/notifications')

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled()
    })
  })

  it('disables submit button while loading', async () => {
    mockSignInWithEmail.mockImplementation(() => new Promise(() => {}))

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDefined()
  })

  it('shows error for unknown error from signIn', async () => {
    mockSignInWithEmail.mockResolvedValue({ ok: false, error: { code: 'UNKNOWN', message: '' } })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao fazer login')).toBeDefined()
    })
  })

  it('processes legacy pending actions on login', async () => {
    mockGetPendingAction.mockReturnValue({
      type: 'favorite',
      payload: { bookId: 'book-1' },
      timestamp: Date.now(),
    })
    mockAddToFavorites.mockResolvedValue({ ok: true })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockClearPendingAction).toHaveBeenCalled()
      expect(mockAddToFavorites).toHaveBeenCalledWith('book-1')
    })
  })

  it('processes array-based pending actions on login', async () => {
    mockGetPendingActions.mockReturnValue([
      { type: 'follow', payload: { authorName: 'Author Name' }, timestamp: Date.now() },
      { type: 'rate', payload: { bookId: 'book-2', rating: 5 }, timestamp: Date.now() },
    ])
    mockFollowAuthor.mockResolvedValue({ ok: true })
    mockRateBook.mockResolvedValue({ ok: true })

    render(<LoginFormWidget />)

    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'correctpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockClearPendingActions).toHaveBeenCalled()
      expect(mockFollowAuthor).toHaveBeenCalledWith('Author Name')
      expect(mockRateBook).toHaveBeenCalledWith('book-2', 5)
    })
  })
})
