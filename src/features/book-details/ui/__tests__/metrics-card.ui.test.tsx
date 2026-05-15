import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsCard } from '../metrics-card.ui'

describe('MetricsCard', () => {
  const defaultIcon = <span data-testid="icon">Icon</span>

  it('renders label and value', () => {
    render(<MetricsCard label="Pages" value={100} icon={defaultIcon} />)
    expect(screen.getByText('Pages')).toBeDefined()
    expect(screen.getByText('100')).toBeDefined()
  })

  it('renders as div when no onClick', () => {
    const { container } = render(<MetricsCard label="Pages" value={100} icon={defaultIcon} />)
    const element = container.firstChild as HTMLElement
    expect(element.tagName).toBe('DIV')
  })

  it('renders as button when onClick is provided', () => {
    const onClick = vi.fn()
    const { container } = render(
      <MetricsCard label="Pages" value={100} icon={defaultIcon} onClick={onClick} />
    )
    const element = container.firstChild as HTMLElement
    expect(element.tagName).toBe('BUTTON')
  })

  it('calls onClick when button is clicked', () => {
    const onClick = vi.fn()
    render(<MetricsCard label="Pages" value={100} icon={defaultIcon} onClick={onClick} />)
    fireEvent.click(screen.getByText('Pages').closest('button')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows checkmark when isActive', () => {
    render(<MetricsCard label="Pages" value={100} icon={defaultIcon} isActive />)
    expect(screen.getByText('✓')).toBeDefined()
  })

  it('shows loading spinner when isLoading', () => {
    const { container } = render(
      <MetricsCard label="Pages" value={100} icon={defaultIcon} isLoading />
    )
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeDefined()
  })

  it('shows displayValue instead of value when provided', () => {
    render(
      <MetricsCard label="Rating" value={0} displayValue="4.5 / 5" icon={defaultIcon} />
    )
    expect(screen.getByText('4.5 / 5')).toBeDefined()
    expect(screen.queryByText('0')).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MetricsCard label="Pages" value={100} icon={defaultIcon} className="custom-class" />
    )
    const element = container.firstChild as HTMLElement
    expect(element.className).toContain('custom-class')
  })
})
