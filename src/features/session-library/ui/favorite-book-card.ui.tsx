'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { BookCover } from '@/shared/ui/book-cover.ui'
import { cn } from '@/utils/cn'
import type { SessionFavoriteBook } from '../types/session-library.types'

type FavoriteBookCardProps = {
  book: SessionFavoriteBook
  onRemove?: (bookId: string) => void
  index?: number
}

export function FavoriteBookCard({
  book,
  onRemove,
  index = 0,
}: FavoriteBookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative shrink-0 w-28 sm:w-32"
    >
      <Link
        href={`/book/${book.bookId}`}
        className="block"
      >
        <BookCover
          title={book.bookTitle}
          coverUrl={book.bookCoverUrl || undefined}
          coverColor={book.bookCoverColor || '#8B4513'}
          size="md"
          className="shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="mt-2 text-center">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
            {book.bookTitle}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{book.bookAuthor}</p>
        </div>
      </Link>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onRemove(book.bookId)
          }}
          className={cn(
            'absolute top-2 right-2 flex h-8 w-8 items-center justify-center',
            'rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100',
            'transition-opacity hover:bg-red-50 hover:text-red-500',
            'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500'
          )}
          aria-label={`Remover ${book.bookTitle} dos favoritos`}
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </button>
      )}
    </motion.div>
  )
}
