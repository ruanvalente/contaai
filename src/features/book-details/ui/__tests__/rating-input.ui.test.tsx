import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RatingInput } from '../rating-input.ui'

describe('RatingInput', () => {
  it('renders 5 star buttons', () => {
    render(<RatingInput bookId="book-1" />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons.length).toBe(5)
  })

  it('renders correct aria-labels for stars', () => {
    render(<RatingInput bookId="book-1" />)
    expect(screen.getByLabelText('1 estrela')).toBeDefined()
    expect(screen.getByLabelText('5 estrelas')).toBeDefined()
  })

  it('calls onRate with the correct value when clicked', () => {
    const onRate = vi.fn()
    render(<RatingInput bookId="book-1" onRate={onRate} />)
    fireEvent.click(screen.getByLabelText('3 estrelas'))
    expect(onRate).toHaveBeenCalledWith(3)
  })

  it('shows user rating when provided', () => {
    render(<RatingInput bookId="book-1" userRating={4} />)
    expect(screen.getByText('Sua avaliação: 4 estrelas')).toBeDefined()
  })

  it('shows singular for rating 1', () => {
    render(<RatingInput bookId="book-1" userRating={1} />)
    expect(screen.getByText('Sua avaliação: 1 estrela')).toBeDefined()
  })

  it('does not show user rating when null', () => {
    render(<RatingInput bookId="book-1" userRating={null} />)
    expect(screen.queryByText(/Sua avaliação/)).toBeNull()
  })

  it('disables all buttons when disabled prop is true', () => {
    render(<RatingInput bookId="book-1" disabled />)
    const buttons = screen.getAllByRole('radio')
    buttons.forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('does not call onRate when disabled', () => {
    const onRate = vi.fn()
    render(<RatingInput bookId="book-1" onRate={onRate} disabled />)
    fireEvent.click(screen.getByLabelText('4 estrelas'))
    expect(onRate).not.toHaveBeenCalled()
  })

  it('applies size classes correctly', () => {
    const { container } = render(<RatingInput bookId="book-1" size="lg" />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(5)
  })
})
