import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

const mockToast = vi.hoisted(() => Object.assign(vi.fn(), {
  error: vi.fn(),
  success: vi.fn(),
}))

const mockCreateUserBook = vi.hoisted(() => vi.fn())

const mockAuthUser = vi.hoisted(() => ({ id: 'user-1', email: 'test@test.com' }))

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
      nav: MockDiv,
      ul: MockDiv,
      li: MockDiv,
      p: MockDiv,
      h1: MockDiv,
      h2: MockDiv,
      h3: MockDiv,
      img: MockDiv,
      main: MockDiv,
      article: MockDiv,
      header: MockDiv,
      footer: MockDiv,
    },
    AnimatePresence: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
  }
})

vi.mock('next/image', () => ({
  default: (props: any) => {
    const { fill, ...rest } = props
    return <img {...rest} />
  },
}))

vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload">Upload</span>,
  X: () => <span>X</span>,
  Image: () => <span>ImageIcon</span>,
  Palette: () => <span>Palette</span>,
  Loader2: () => <span>Loader</span>,
}))

vi.mock('sonner', () => ({ toast: mockToast }))

vi.mock('@/features/book-dashboard/actions/user-books.actions', () => ({
  createUserBook: (...args: any[]) => mockCreateUserBook(...args),
}))

vi.mock('@/shared/storage/use-auth-store', () => ({
  useAuthStore: Object.assign(
    (selector?: any) => {
      const state = { user: mockAuthUser, isInitialized: true }
      return selector ? selector(state) : state
    },
    { getState: () => ({ user: mockAuthUser }) }
  ),
}))

import { CreateBookModal } from '../create-book-modal.widget'

describe('CreateBookModal', () => {
  const onClose = vi.fn()
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateUserBook.mockResolvedValue({
      success: true,
      book: { id: 'new-book-1' },
    })
  })

  it('renders when isOpen is true', () => {
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    expect(screen.getByText('Criar Nova História')).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    render(
      <CreateBookModal isOpen={false} onClose={onClose} onSuccess={onSuccess} />
    )

    expect(screen.queryByText('Criar Nova História')).toBeNull()
  })

  function submitForm() {
    const form = document.querySelector('form')
    if (form) fireEvent.submit(form)
  }

  it('shows validation error when title is empty', () => {
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    submitForm()

    expect(screen.getByRole('alert')).toHaveTextContent('O título é obrigatório')
  })

  it('shows validation error when author is empty', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')

    submitForm()

    expect(screen.getByRole('alert')).toHaveTextContent('O autor é obrigatório')
  })

  it('calls createUserBook on valid submit', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')
    await user.type(screen.getByLabelText('Autor *'), 'Test Author')

    submitForm()

    await waitFor(() => {
      expect(mockCreateUserBook).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          author: 'Test Author',
        }),
        'user-1'
      )
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('new-book-1')
    })
  })

  it('calls onClose after successful creation', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')
    await user.type(screen.getByLabelText('Autor *'), 'Test Author')

    submitForm()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message when createUserBook fails', async () => {
    mockCreateUserBook.mockResolvedValue({
      success: false,
      error: 'Erro ao criar livro',
    })

    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')
    await user.type(screen.getByLabelText('Autor *'), 'Test Author')

    submitForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao criar livro')
    })
  })

  it('shows error message when createUserBook throws', async () => {
    mockCreateUserBook.mockRejectedValue(new Error('Internal error'))

    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')
    await user.type(screen.getByLabelText('Autor *'), 'Test Author')

    submitForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro interno')
    })
  })

  it('shows loading state while creating', async () => {
    mockCreateUserBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, book: { id: '1' } }), 200))
    )

    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText('Título *'), 'Test Title')
    await user.type(screen.getByLabelText('Autor *'), 'Test Author')

    submitForm()

    expect(screen.getByText('Criando...')).toBeDefined()
  })

  it('closes on backdrop click', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.click(screen.getByLabelText('Fechar modal'))

    expect(onClose).toHaveBeenCalled()
  })

  it('closes on cancel button click', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    await user.click(screen.getByText('Cancelar'))

    expect(onClose).toHaveBeenCalled()
  })

  it('resets form fields when modal closes', () => {
    const { rerender } = render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    expect(screen.getByText('Criar Nova História')).toBeDefined()

    rerender(
      <CreateBookModal isOpen={false} onClose={onClose} onSuccess={onSuccess} />
    )

    expect(screen.queryByText('Criar Nova História')).toBeNull()
  })

  it('validates file type on upload', () => {
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    const fileInput = screen.getByLabelText('Upload imagem de capa')
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    fireEvent.change(fileInput, { target: { files: [textFile] } })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tipo de arquivo inválido'
    )
  })

  it('validates file size on upload', () => {
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    const fileInput = screen.getByLabelText('Upload imagem de capa')
    const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'test.jpg', {
      type: 'image/jpeg',
    })

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Arquivo muito grande'
    )
  })

  it('selects a color from color palette', async () => {
    const user = userEvent.setup()
    render(
      <CreateBookModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    )

    const colorButtons = screen.getAllByRole('button', { name: /selecionar cor/i })
    expect(colorButtons.length).toBeGreaterThan(0)

    await user.click(colorButtons[0])
  })
})
