import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('@/shared/ui/container.ui', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, variant, className, ...props }: any) => {
    const { whileHover, whileTap, ...rest } = props
    return <button {...rest}>{children}</button>
  },
}))

vi.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
      button: React.forwardRef((props: any, ref: any) => React.createElement('button', { ...props, ref })),
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

import { Header } from '../landing-header.widget'

describe('Header', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the logo', () => {
    render(<Header />)
    const logo = screen.getByText('Conta')
    expect(logo).toBeDefined()
    expect(screen.getByText('AI')).toBeDefined()
  })

  it('renders all navigation items', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Explorar')).toBeDefined()
    expect(screen.getByText('Minha Sessão')).toBeDefined()
    expect(screen.getByText('Comunidade')).toBeDefined()
    expect(screen.getByText('Contribuir')).toBeDefined()
  })

  it('renders login and register buttons', () => {
    render(<Header />)
    expect(screen.getByText('Entrar')).toBeDefined()
    expect(screen.getByText('Criar Conta')).toBeDefined()
  })

  it('login button links to /login', () => {
    render(<Header />)
    const loginLink = screen.getByText('Entrar').closest('a')
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('register button links to /register', () => {
    render(<Header />)
    const registerLink = screen.getByText('Criar Conta').closest('a')
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('toggles mobile menu when hamburger button is clicked', async () => {
    render(<Header />)

    const menuButton = screen.getByLabelText('Abrir menu')
    expect(menuButton).toBeDefined()

    await user.click(menuButton)

    expect(screen.getByLabelText('Fechar menu')).toBeDefined()

    await user.click(screen.getByLabelText('Fechar menu'))

    expect(screen.getByLabelText('Abrir menu')).toBeDefined()
  })

  it('mobile menu shows navigation and auth links when open', async () => {
    render(<Header />)

    await user.click(screen.getByLabelText('Abrir menu'))

    expect(screen.getAllByText('Entrar').length).toBe(2)
    expect(screen.getAllByText('Criar Conta').length).toBe(2)
    expect(screen.getAllByText('Home').length).toBe(2)
  })

  it('has correct aria attributes on menu button', () => {
    render(<Header />)

    const button = screen.getByLabelText('Abrir menu')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-controls')).toBe('mobile-menu')
  })
})
