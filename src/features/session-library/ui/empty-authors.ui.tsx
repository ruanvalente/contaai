'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { Button } from '@/shared/ui/button.ui'

export function EmptyAuthors() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-300/50 mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Nenhum autor seguido ainda
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        Siga seus autores favoritos para acompanhar suas publicações
        e novidades. Eles aparecerão aqui.
      </p>
      <Link href="/explore" className="mt-6">
        <Button variant="primary" className="px-6 py-2.5">
          Descobrir Autores
        </Button>
      </Link>
    </div>
  )
}
