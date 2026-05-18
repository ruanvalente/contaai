import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/use-session-library', () => ({
  useSessionLibrary: vi.fn()
}))

vi.mock('../session-sync-banner.widget', () => ({
  SessionSyncBanner: () => null
}))

vi.mock('../session-favorites-list.widget', () => ({
  SessionFavoritesList: ({ favorites }: any) => {
    if (!favorites || favorites.length === 0) {
      return <div>Nenhum livro favoritado ainda</div>
    }
    return <div>favorites list</div>
  }
}))

vi.mock('../session-authors-list.widget', () => ({
  SessionAuthorsList: ({ authors }: any) => {
    if (!authors || authors.length === 0) {
      return <div>Nenhum autor seguido ainda</div>
    }
    return <div>authors list</div>
  }
}))

import { useSessionLibrary } from '../../hooks/use-session-library'
import { SessionLibraryWidget } from '../session-library.widget'

describe('SessionLibraryWidget', () => {
  beforeEach(() => {
    vi.mocked(useSessionLibrary).mockReturnValue({
      activeTab: 'favorites',
      setActiveTab: vi.fn(),
      favorites: [],
      authors: [],
      isLoading: false,
      isLoaded: true,
      isAuthenticated: false,
      favoritesCount: 0,
      authorsCount: 0,
      refetch: vi.fn()
    })
  })

  it('renders the session hero', () => {
    render(<SessionLibraryWidget />)
    expect(screen.getByText('Minha Sessão')).toBeDefined()
  })

  it('renders tabs for favorites and authors', () => {
    render(<SessionLibraryWidget />)
    expect(screen.getByText('Favoritos')).toBeDefined()
    expect(screen.getByText('Autores')).toBeDefined()
  })

  it('shows favorites tab content by default', () => {
    render(<SessionLibraryWidget />)
    expect(screen.getByText('Nenhum livro favoritado ainda')).toBeDefined()
  })

  it('shows authors tab when activeTab is authors', () => {
    vi.mocked(useSessionLibrary).mockReturnValue({
      activeTab: 'authors',
      setActiveTab: vi.fn(),
      favorites: [],
      authors: [],
      isLoading: false,
      isLoaded: true,
      isAuthenticated: false,
      favoritesCount: 0,
      authorsCount: 0,
      refetch: vi.fn()
    })

    render(<SessionLibraryWidget />)
    expect(screen.getByText('Nenhum autor seguido ainda')).toBeDefined()
  })

  it('renders anonymous hero variant when not authenticated', () => {
    render(<SessionLibraryWidget />)
    expect(screen.getByText('Fazer login')).toBeDefined()
    expect(screen.getByText('Criar conta')).toBeDefined()
  })
})
