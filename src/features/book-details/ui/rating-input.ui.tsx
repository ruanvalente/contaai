'use client'

import { useState, useCallback, useMemo } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

type RatingInputProps = {
  bookId: string
  currentRating?: number
  userRating?: number | null
  size?: 'sm' | 'md' | 'lg'
  onRate?: (rating: number) => void
  disabled?: boolean
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function RatingInput({
  bookId: _bookId,
  currentRating = 0,
  userRating = null,
  size = 'md',
  onRate,
  disabled = false,
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayRating = useMemo(() => {
    if (hoverRating !== null) return hoverRating
    if (userRating !== null && userRating !== undefined) return userRating
    return 0
  }, [hoverRating, userRating])

  const handleClick = useCallback(
    (rating: number) => {
      if (disabled || isSubmitting) return
      
      setIsSubmitting(true)
      try {
        onRate?.(rating)
      } finally {
        setIsSubmitting(false)
      }
    },
    [disabled, isSubmitting, onRate]
  )

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn('flex items-center gap-0.5', disabled && 'cursor-not-allowed opacity-50')}
        role="radiogroup"
        aria-label="Avaliar livro"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating
          const isHalf = !isFilled && star - 0.5 <= displayRating

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === displayRating}
              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
              disabled={disabled || isSubmitting}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              className={cn(
                'p-0.5 transition-colors duration-150',
                'hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded',
                disabled && 'cursor-not-allowed'
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  'transition-colors duration-150',
                  isFilled && 'fill-yellow-400 text-yellow-400',
                  isHalf && 'fill-yellow-200 text-yellow-400',
                  !isFilled && !isHalf && 'text-gray-300'
                )}
              />
            </button>
          )
        })}
      </div>

      {userRating !== null && userRating !== undefined && (
        <span className="text-xs text-gray-500">
          Sua avaliação: {userRating} estrela{userRating > 1 ? 's' : ''}
        </span>
      )}

      {isSubmitting && (
        <span className="text-xs text-gray-400">Avaliando...</span>
      )}
    </div>
  )
}
