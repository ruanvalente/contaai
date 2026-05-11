'use client'

import { useSessionLibrary } from '../hooks/use-session-library'
import { SessionHero } from '../ui/session-hero.ui'
import { SessionTabs } from '../ui/session-tabs.ui'
import { SessionFavoritesList } from './session-favorites-list.widget'
import { SessionAuthorsList } from './session-authors-list.widget'
import { SessionSyncBanner } from './session-sync-banner.widget'

export function SessionLibraryWidget() {
  const {
    activeTab,
    setActiveTab,
    favorites,
    authors,
    isLoading,
    isLoaded,
    isAuthenticated,
    favoritesCount,
    authorsCount,
  } = useSessionLibrary()

  const heroVariant = isAuthenticated ? 'authenticated' : 'anonymous'

  return (
    <div className="space-y-6">
      <SessionHero variant={heroVariant} />

      <SessionSyncBanner />

      <SessionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favoritesCount}
        authorsCount={authorsCount}
      />

      {activeTab === 'favorites' && (
        <SessionFavoritesList
          favorites={favorites}
          isLoading={isLoading && !isLoaded}
        />
      )}

      {activeTab === 'authors' && (
        <SessionAuthorsList
          authors={authors}
          isLoading={isLoading && !isLoaded}
        />
      )}
    </div>
  )
}
