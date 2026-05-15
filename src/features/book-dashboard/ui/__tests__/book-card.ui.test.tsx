import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BookCard } from '../book-card.ui'
import type { Book } from '@/server/domain/entities/book.entity'

const mockBook: Book = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  coverColor: '#8B4513',
  category: 'Fantasy',
  description: 'A test book',
  pages: 100,
  rating: 4.5,
  ratingCount: 10,
  reviewCount: 5,
  createdAt: new Date(),
}

describe('BookCard', () => {
  it('renders book title and author', () => {
    render(<BookCard book={mockBook} />)
    const titles = screen.getAllByText('Test Book')
    expect(titles.length).toBe(2)
    expect(screen.getByText('Test Author')).toBeDefined()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<BookCard book={mockBook} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(mockBook)
  })

  it('renders cover with correct background color', () => {
    const { container } = render(<BookCard book={mockBook} />)
    const coverDiv = container.querySelector('[style*="background-color"]') as HTMLElement
    expect(coverDiv?.style.backgroundColor).toBe('rgb(139, 69, 19)')
  })

  it('applies custom className', () => {
    const { container } = render(<BookCard book={mockBook} className="custom" />)
    const button = container.firstChild as HTMLElement
    expect(button.className).toContain('custom')
  })

  it('renders as a button element', () => {
    const { container } = render(<BookCard book={mockBook} />)
    const element = container.firstChild as HTMLElement
    expect(element.tagName).toBe('BUTTON')
  })
})
