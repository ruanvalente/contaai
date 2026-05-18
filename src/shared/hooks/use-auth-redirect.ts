'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/shared/storage/use-auth-store'

type PendingAction = {
  type: 'follow' | 'unfollow' | 'rate' | 'favorite' | 'unfavorite'
  payload: Record<string, unknown>
  timestamp: number
}

const PENDING_ACTION_KEY = 'pending_action'

export function savePendingAction(action: PendingAction) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action))
  }
}

export function getPendingAction(): PendingAction | null {
  if (typeof window === 'undefined') return null
  
  try {
    const data = localStorage.getItem(PENDING_ACTION_KEY)
    if (!data) return null
    
    const action = JSON.parse(data) as PendingAction
    
    if (Date.now() - action.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(PENDING_ACTION_KEY)
      return null
    }
    
    return action
  } catch {
    localStorage.removeItem(PENDING_ACTION_KEY)
    return null
  }
}

export function clearPendingAction() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PENDING_ACTION_KEY)
  }
}

export function useAuthRedirect() {
  const user = useAuthStore((state) => state.user)
  
  const requireAuth = useCallback(
    (callback: () => Promise<void> | void, options?: {
      redirectTo?: string
      intent?: PendingAction['type']
      payload?: Record<string, unknown>
    }) => {
      if (user) {
        return callback()
      }
      
      const pendingAction: PendingAction | undefined = options?.intent
        ? {
            type: options.intent,
            payload: options.payload || {},
            timestamp: Date.now(),
          }
        : undefined
      
      if (pendingAction) {
        savePendingAction(pendingAction)
      }
      
      const redirectUrl = new URL(
        options?.redirectTo || '/login',
        window.location.origin
      )
      
      if (typeof window !== 'undefined') {
        redirectUrl.searchParams.set('redirect', window.location.pathname + window.location.search)
      }
      
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl.toString()
      }
    },
    [user]
  )
  
  return { requireAuth, isAuthenticated: !!user }
}
