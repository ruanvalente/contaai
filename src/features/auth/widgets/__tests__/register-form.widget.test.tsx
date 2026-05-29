import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSignUpWithEmail = vi.fn()
const mockRouterPush = vi.fn()

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
  }),
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
  return { toast: mockToast }
})

vi.mock('@/features/auth/actions/auth.actions', () => ({
  signUpWithEmail: (...args: any[]) => mockSignUpWithEmail(...args),
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

import { RegisterFormWidget } from '../register-form.widget'

describe('RegisterFormWidget', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignUpWithEmail.mockResolvedValue({ ok: true, data: { needsConfirmation: false } })
  })

  it('renders the register form with all elements', () => {
    render(<RegisterFormWidget />)

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeDefined()
    expect(screen.getByText('Junte-se à nossa comunidade de leitores')).toBeDefined()
    expect(screen.getByLabelText('Nome')).toBeDefined()
    expect(screen.getByLabelText('E-mail')).toBeDefined()
    expect(screen.getByLabelText('Senha')).toBeDefined()
    expect(screen.getByLabelText('Confirmar senha')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDefined()
    expect(screen.getByText('Entre')).toBeDefined()
  })

  it('shows error when passwords do not match', async () => {
    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'differentpass')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeDefined()
    })
    expect(mockSignUpWithEmail).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), '12345')
    await user.type(screen.getByLabelText('Confirmar senha'), '12345')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeDefined()
    })
    expect(mockSignUpWithEmail).not.toHaveBeenCalled()
  })

  it('calls signUpWithEmail and redirects on successful registration', async () => {
    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('test@test.com', 'password123', 'Test User')
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows confirmation message when needsConfirmation is true', async () => {
    mockSignUpWithEmail.mockResolvedValue({ ok: true, data: { needsConfirmation: true } })

    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText(/Verifique seu e-mail/)).toBeDefined()
    })
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('shows error when signUp returns error', async () => {
    mockSignUpWithEmail.mockResolvedValue({ ok: false, error: { code: 'EMAIL_EXISTS', message: 'Este e-mail já está cadastrado' } })

    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'existing@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Este e-mail já está cadastrado')).toBeDefined()
    })
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    mockSignUpWithEmail.mockImplementation(() => new Promise(() => {}))

    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByRole('button', { name: 'Criando conta...' })).toBeDefined()
  })

  it('handles internal errors gracefully', async () => {
    mockSignUpWithEmail.mockRejectedValue(new Error('Network error'))

    render(<RegisterFormWidget />)

    await user.type(screen.getByLabelText('Nome'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Erro interno. Tente novamente.')).toBeDefined()
    })
  })

  it('renders terms and privacy links', () => {
    render(<RegisterFormWidget />)

    expect(screen.getByText('Termos de Uso')).toBeDefined()
    expect(screen.getByText('Política de Privacidade')).toBeDefined()
  })
})
