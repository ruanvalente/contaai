'use client'

import { motion } from 'framer-motion'
import { BookOpen, User } from 'lucide-react'
import { Avatar } from '@/shared/ui/avatar.ui'
import { FollowButtonUI } from '@/shared/ui/follow-button.ui'
import type { SessionFollowedAuthor } from '../types/session-library.types'

interface FollowedAuthorCardProps {
  author: SessionFollowedAuthor
  isFollowing: boolean
  isLoading: boolean
  onFollow: () => void
  onUnfollow: () => void
  index?: number
}

export function FollowedAuthorCard({
  author,
  isFollowing,
  isLoading,
  onFollow,
  onUnfollow,
  index = 0,
}: FollowedAuthorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm border border-primary-200"
    >
      <Avatar
        name={author.authorName}
        src={author.avatarUrl || undefined}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {author.authorName}
        </h3>

        {author.bio && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {author.bio}
          </p>
        )}

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {author.booksCount}{' '}
            {author.booksCount === 1 ? 'livro' : 'livros'}
          </span>
        </div>

        <div className="mt-3">
          <FollowButtonUI
            isFollowing={isFollowing}
            isLoading={isLoading}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            authorName={author.authorName}
            className="text-sm py-1.5"
          />
        </div>
      </div>
    </motion.div>
  )
}
