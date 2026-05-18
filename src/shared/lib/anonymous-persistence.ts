const PENDING_ACTIONS_KEY = 'pending_actions'
const TTL = 24 * 60 * 60 * 1000

export type PendingActionType = 'follow' | 'rate' | 'favorite'

export interface PendingAction {
  type: PendingActionType
  payload: Record<string, unknown>
  timestamp: number
}

export function savePendingAction(action: PendingAction): void {
  if (typeof window === 'undefined') return
  const actions = getPendingActions()
  actions.push(action)
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions))
}

export function getPendingActions(): PendingAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PENDING_ACTIONS_KEY)
    if (!raw) return []
    const actions: PendingAction[] = JSON.parse(raw)
    const cutoff = Date.now() - TTL
    return actions.filter((a) => a.timestamp > cutoff)
  } catch {
    localStorage.removeItem(PENDING_ACTIONS_KEY)
    return []
  }
}

export function clearPendingActions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PENDING_ACTIONS_KEY)
}

export async function syncPendingActions(userId: string): Promise<{ synced: number; failed: number }> {
  const actions = getPendingActions()
  if (actions.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const action of actions) {
    try {
      if (action.type === 'follow') {
        const { followAuthor } = await import('@/features/author-follow/actions/author-follow.actions')
        const result = await followAuthor(action.payload.authorName as string)
        if (result.success) synced++
        else failed++
      } else if (action.type === 'favorite') {
        const { addToFavorites } = await import('@/features/discovery/actions/favorites.actions')
        const result = await addToFavorites(
          action.payload.bookId as string,
        )
        if (result.success) synced++
        else failed++
      } else if (action.type === 'rate') {
        const { rateBook } = await import('@/features/book-details/actions/rate-book.action')
        const result = await rateBook(
          action.payload.bookId as string,
          action.payload.rating as number,
        )
        if (result.success) synced++
        else failed++
      }
    } catch {
      failed++
    }
  }

  if (failed === 0) {
    clearPendingActions()
  } else {
    const remaining = getPendingActions().slice(failed)
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(remaining))
  }

  return { synced, failed }
}
