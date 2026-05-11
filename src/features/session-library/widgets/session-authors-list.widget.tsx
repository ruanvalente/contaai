'use client'

import { useCallback } from 'react'
import { useAuthorFollowStore } from '@/features/author-follow/hooks/use-author-follow'
import { FollowedAuthorCard } from '../ui/followed-author-card.ui'
import { EmptyAuthors } from '../ui/empty-authors.ui'
import type { SessionFollowedAuthor } from '../types/session-library.types'

interface SessionAuthorsListProps {
  authors: SessionFollowedAuthor[]
  isLoading: boolean
}

export function SessionAuthorsList({
  authors,
  isLoading,
}: SessionAuthorsListProps) {
  const follow = useAuthorFollowStore((s) => s.follow)
  const unfollow = useAuthorFollowStore((s) => s.unfollow)
  const isFollowing = useAuthorFollowStore((s) => s.isFollowing)
  const isStoreLoading = useAuthorFollowStore((s) => s.isLoading)

  const handleFollow = useCallback(
    (authorName: string) => {
      follow(authorName)
    },
    [follow]
  )

  const handleUnfollow = useCallback(
    (authorName: string) => {
      unfollow(authorName)
    },
    [unfollow]
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-start gap-4 rounded-xl bg-white p-4">
            <div className="h-12 w-12 rounded-full bg-primary-300 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-primary-300" />
              <div className="h-3 w-2/3 rounded bg-primary-300" />
              <div className="h-3 w-1/4 rounded bg-primary-300" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (authors.length === 0) {
    return <EmptyAuthors />
  }

  return (
    <div className="space-y-3">
      {authors.map((author, index) => (
        <FollowedAuthorCard
          key={author.authorName}
          author={author}
          isFollowing={isFollowing(author.authorName)}
          isLoading={isStoreLoading}
          onFollow={() => handleFollow(author.authorName)}
          onUnfollow={() => handleUnfollow(author.authorName)}
          index={index}
        />
      ))}
    </div>
  )
}
