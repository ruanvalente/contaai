import { vi } from 'vitest'
import type { StoreApi } from 'zustand'

export function mockStore<T extends object>(
  store: StoreApi<T>,
  mockState: Partial<T>
) {
  const originalState = store.getState()
  store.setState({ ...originalState, ...mockState }, true)

  return {
    restore: () => store.setState(originalState, true)
  }
}

export function createMockStoreHook<T extends object>(
  useStore: (selector: (state: T) => any) => any
) {
  return vi.fn().mockImplementation((selector) =>
    selector({} as T)
  )
}
