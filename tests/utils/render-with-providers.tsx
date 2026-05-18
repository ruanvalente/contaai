import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement } from 'react'

interface WrapperProps {
  children: React.ReactNode
}

function createWrapper() {
  return function Wrapper({ children }: WrapperProps) {
    return React.createElement(React.Fragment, null, children)
  }
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const wrapper = createWrapper()
  return render(ui, { wrapper, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
