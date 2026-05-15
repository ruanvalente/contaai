import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RatingStars } from '../rating-stars.ui'

describe('RatingStars', () => {
  it('renders the rating value', () => {
    render(<RatingStars rating={4.5} />)
    expect(screen.getByText('4.5')).toBeDefined()
  })

  it('renders all filled stars for max rating', () => {
    const { container } = render(<RatingStars rating={5} />)
    const stars = container.querySelectorAll('.text-warning.fill-warning')
    expect(stars.length).toBe(5)
  })

  it('renders correct filled stars for partial rating', () => {
    const { container } = render(<RatingStars rating={3} />)
    const filledStars = container.querySelectorAll('.text-warning.fill-warning')
    expect(filledStars.length).toBe(3)
  })

  it('renders empty stars for remaining', () => {
    const { container } = render(<RatingStars rating={2} />)
    const emptyStars = container.querySelectorAll('.text-gray-300')
    expect(emptyStars.length).toBe(3)
  })

  it('hides value when showValue is false', () => {
    render(<RatingStars rating={4} showValue={false} />)
    expect(screen.queryByText('4.0')).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(<RatingStars rating={3} className="custom-class" />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('custom-class')
  })

  it('handles zero rating', () => {
    const { container } = render(<RatingStars rating={0} />)
    const emptyStars = container.querySelectorAll('.text-gray-300')
    expect(emptyStars.length).toBe(5)
    expect(screen.getByText('0.0')).toBeDefined()
  })
})
