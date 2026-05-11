'use client'

import Link from 'next/link'
import { BookHeart } from 'lucide-react'
import { Button } from '@/shared/ui/button.ui'
import { cn } from '@/utils/cn'

type HeroVariant = 'anonymous' | 'authenticated' | 'syncing'

interface SessionHeroProps {
  variant: HeroVariant
  className?: string
}

const messages: Record<HeroVariant, { title: string; description: string }> = {
  anonymous: {
    title: 'Seus favoritos e autores, salvos aqui.',
    description:
      'Faça login para sincronizar seus dados e acessar de qualquer dispositivo.',
  },
  authenticated: {
    title: 'Dados sincronizados com sua conta!',
    description:
      'Seus favoritos e conexões estão seguros na sua biblioteca pessoal.',
  },
  syncing: {
    title: 'Sincronizando seus dados...',
    description: 'Aguarde enquanto transferimos suas informações.',
  },
}

export function SessionHero({ variant, className }: SessionHeroProps) {
  const { title, description } = messages[variant]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d2419] to-[#1a1510] p-8 text-white',
        className
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-xl bg-accent-500/20 shrink-0">
            <BookHeart className="h-7 w-7 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Minha Sessão
            </h1>
            <p className="mt-2 text-[#c2a47e] max-w-lg">{title}</p>
            <p className="mt-1 text-sm text-[#a08060] max-w-lg">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {variant === 'anonymous' && (
            <>
              <Link href="/login">
                <Button
                  variant="secondary"
                  className="px-5 py-2 text-sm bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Fazer login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  className="px-5 py-2 text-sm bg-accent-500 hover:bg-accent-600"
                >
                  Criar conta
                </Button>
              </Link>
            </>
          )}
          {variant === 'authenticated' && (
            <Link href="/dashboard">
              <Button
                variant="primary"
                className="px-5 py-2 text-sm bg-accent-500 hover:bg-accent-600"
              >
                Ir para Dashboard
              </Button>
            </Link>
          )}
          {variant === 'syncing' && (
            <div className="flex items-center gap-2 text-sm text-accent-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
              Sincronizando...
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
    </div>
  )
}
