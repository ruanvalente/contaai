'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/ui/button.ui'

export function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-300/50 mb-4">
        <Heart className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Nenhum livro favoritado ainda
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        Explore os livros disponíveis e favorite aqueles que mais gostar.
        Eles aparecerão aqui automaticamente.
      </p>
      <Link href="/explore" className="mt-6">
        <Button variant="primary" className="px-6 py-2.5">
          Explorar Livros
        </Button>
      </Link>
    </div>
  )
}
