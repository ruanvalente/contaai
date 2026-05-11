'use client'

import { useCallback } from 'react'
import { useFavorites } from '@/features/discovery/hooks/use-favorites'
import { FavoriteBookCard } from '../ui/favorite-book-card.ui'
import { EmptyFavorites } from '../ui/empty-favorites.ui'
import type { SessionFavoriteBook } from '../types/session-library.types'

interface SessionFavoritesListProps {
  favorites: SessionFavoriteBook[]
  isLoading: boolean
}

export function SessionFavoritesList({
  favorites,
  isLoading,
}: SessionFavoritesListProps) {
  const { removeFavorite } = useFavorites()

  const handleRemove = useCallback(
    (bookId: string) => {
      removeFavorite(bookId)
    },
    [removeFavorite]
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-lg bg-primary-300" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-primary-300" />
              <div className="h-2 w-1/2 rounded bg-primary-300" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return <EmptyFavorites />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {favorites.map((book, index) => (
        <FavoriteBookCard
          key={book.id}
          book={book}
          onRemove={handleRemove}
          index={index}
        />
      ))}
    </div>
  )
}
