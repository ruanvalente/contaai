'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFavorites } from '@/features/discovery/hooks/use-favorites'
import { useAuthorFollowStore } from '@/features/author-follow/hooks/use-author-follow'
import { useAuthStore } from '@/shared/storage/use-auth-store'
import { getAnonymousSessionId } from '@/shared/lib/anonymous-session'
import { getSessionFavoritesAction } from '../actions/get-session-favorites.action'
import { getSessionFollowedAuthorsAction } from '../actions/get-session-followed-authors.action'
import { getFromCache, saveToCache, clearCache } from '../lib/session-cache'
import type { SessionTab, SessionFavoriteBook, SessionFollowedAuthor } from '../types/session-library.types'

interface UseSessionLibraryReturn {
  activeTab: SessionTab
  setActiveTab: (tab: SessionTab) => void
  favorites: SessionFavoriteBook[]
  authors: SessionFollowedAuthor[]
  isLoading: boolean
  isLoaded: boolean
  isAuthenticated: boolean
  favoritesCount: number
  authorsCount: number
  refetch: () => Promise<void>
}

export function useSessionLibrary(): UseSessionLibraryReturn {
  const [activeTab, setActiveTab] = useState<SessionTab>('favorites')
  const [favorites, setFavorites] = useState<SessionFavoriteBook[]>([])
  const [authors, setAuthors] = useState<SessionFollowedAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuthStore()
  const isAuthenticated = !!user
  const initializedRef = useRef(false)

  const { favoritedIds } = useFavorites()
  const followedIds = useAuthorFollowStore((s) => s.followedIds)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const sessionId = getAnonymousSessionId()

      const cached = getFromCache(sessionId)
      if (cached && !isLoaded) {
        setFavorites(cached.favorites)
        setAuthors(cached.authors)
      }

      const [favData, authData] = await Promise.all([
        getSessionFavoritesAction(sessionId),
        getSessionFollowedAuthorsAction(sessionId),
      ])

      setFavorites(favData)
      setAuthors(authData)

      saveToCache({
        favorites: favData,
        authors: authData,
        timestamp: Date.now(),
        sessionId,
      })

      setIsLoaded(true)
    } catch {
      // Keep cached data if fetch fails
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded])

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      loadData()
    }
  }, [loadData])

  // Refetch when auth state changes (login/logout)
  useEffect(() => {
    if (initializedRef.current) {
      clearCache()
      loadData()
    }
  }, [user, loadData])

  const refetch = useCallback(async () => {
    clearCache()
    await loadData()
  }, [loadData])

  return {
    activeTab,
    setActiveTab,
    favorites,
    authors,
    isLoading,
    isLoaded,
    isAuthenticated,
    favoritesCount: favorites.length,
    authorsCount: authors.length,
    refetch,
  }
}
