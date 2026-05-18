'use client'

import { motion } from 'framer-motion'
import { Heart, Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SessionTab } from '../types/session-library.types'

interface SessionTabsProps {
  activeTab: SessionTab
  onTabChange: (tab: SessionTab) => void
  favoritesCount: number
  authorsCount: number
}

const tabs: { id: SessionTab; label: string; icon: typeof Heart }[] = [
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'authors', label: 'Autores', icon: Users },
]

export function SessionTabs({
  activeTab,
  onTabChange,
  favoritesCount,
  authorsCount,
}: SessionTabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-primary-300/50 p-1 w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const count = tab.id === 'favorites' ? favoritesCount : authorsCount
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-primary-300/50'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 bg-accent-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-200 text-gray-600'
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
