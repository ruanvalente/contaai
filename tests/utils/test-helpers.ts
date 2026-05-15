import { vi } from 'vitest'
import React from 'react'

export function createMockPointerEvent(type: string, props?: Partial<PointerEvent>): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    ...props
  })
}

export function createMockKeyboardEvent(type: string, props?: Partial<KeyboardEvent>): KeyboardEvent {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...props
  })
}

export function createMockMouseEvent(type: string, props?: Partial<MouseEvent>): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...props
  })
}

export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export async function waitForMs(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createMockFile(name: string, size: number = 1024, mimeType: string = 'text/plain'): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type: mimeType })
}
