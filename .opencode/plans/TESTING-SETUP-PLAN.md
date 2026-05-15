# Plano de Configuração: Ambiente de Testes (Vitest + Playwright)

**Versão:** 3.0
**Data:** 15/05/2026
**Status:** Em Andamento — 259 testes implementados, editor e E2E adiados
**Referência:** SESSION-LIBRARY-PLAN.md (Sprint 3)

---

> **Nota:** Testes do **Editor** (Lexical) e **E2E** (Playwright) foram adiados por conta da complexidade de setup e dependências. Os itens marcados como `⏭️ Pulado` não são complexos — são **inviáveis no ambiente de teste unitário atual** por dependerem de APIs do Next.js (server actions com `cookies()`, `"use cache"`) ou de infraestrutura externa (Supabase service role key). Esses devem ser testados em ambiente de integração ou E2E.

## 1. Objetivo

Configurar um ambiente completo de testes para **TODAS as features** do projeto Conta.AI, incluindo:

- **Testes Unitários:** Vitest + Testing Library + JSDOM
- **Testes E2E:** Playwright
- **Testes de Componentes:** Vitest + React Testing Library

### Escopo Abrangente

Este plano cobre **todas as features** existentes na pasta `src/features/`:

| Feature | Descrição | Tipos de Teste |
|---------|-----------|----------------|
| `auth` | Autenticação de usuários | Unit, E2E |
| `profile` | Perfil de usuário | Unit, Integration |
| `discovery` | Descoberta de livros (explore) | Unit, E2E |
| `book-dashboard` | Dashboard de livros | Unit, Integration |
| `library` | Biblioteca pessoal | Unit, E2E |
| `author-follow` | Seguir autores | Unit, Integration |
| `book-details` | Detalhes de livros | Unit, E2E |
| `editor` | Editor de livros (Lexical) | Unit, Integration |
| `session-library` | Minha Sessão (anônimo) | Unit, E2E |

### Contexto

O plano `SESSION-LIBRARY-PLAN.md` prevê testes para a feature `session-library` na Sprint 3. No entanto, o projeto **não possui nenhuma configuração de teste** atualmente. Este plano estabelece a fundação necessária para testar **todas as features** do projeto.

---

## 2. Dependências Necessárias

### 2.1 Testes Unitários (Vitest)

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vitest` | latest | Framework de testes |
| `@vitest/ui` | latest | Interface visual para testes |
| `@vitest/coverage-v8` | latest | Cobertura de código |
| `@testing-library/react` | latest | Testes de componentes React |
| `@testing-library/jest-dom` | latest | Matchers customizados para DOM |
| `@testing-library/user-event` | latest | Simulação de interações do usuário |
| `jsdom` | latest | Ambiente DOM para Node.js |
| `@types/testing-library__jest-dom` | latest | Tipos TypeScript |

### 2.2 Testes E2E (Playwright)

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@playwright/test` | latest | Framework de testes E2E |
| `playwright` | latest | Navegadores para testes |

---

## 3. Estrutura de Arquivos

### 3.1 Estrutura Geral para Todas as Features

```
src/
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   │   └── __tests__/
│   │   │       └── migrate-session-data.action.test.ts
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-auth.test.tsx
│   │   └── widgets/
│   │       └── __tests__/
│   │           ├── login-form.widget.test.tsx
│   │           └── register-form.widget.test.tsx
│   │
│   ├── discovery/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-favorites.test.tsx
│   │   ├── widgets/
│   │   │   └── __tests__/
│   │   │       ├── explore.widget.test.tsx
│   │   │       └── landing-header.widget.test.tsx
│   │   └── data/
│   │       └── __tests__/
│   │           └── search-books.test.ts
│   │
│   ├── library/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-user-books.test.tsx
│   │   └── widgets/
│   │       └── __tests__/
│   │           ├── library-content.widget.test.tsx
│   │           └── create-book-modal.widget.test.tsx
│   │
│   ├── author-follow/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-author-follow.test.tsx
│   │   └── actions/
│   │       └── __tests__/
│   │           └── author-follow.actions.test.ts
│   │
│   ├── book-details/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-rating.test.tsx
│   │   ├── widgets/
│   │   │   └── __tests__/
│   │   │       └── book-details-panel.widget.test.tsx
│   │   └── actions/
│   │       └── __tests__/
│   │           └── rate-book.action.test.ts
│   │
│   ├── book-dashboard/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── use-books.test.tsx
│   │   └── data/
│   │       └── __tests__/
│   │           └── cached-books.test.ts
│   │
│   ├── editor/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       ├── use-editor.test.tsx
│   │   │       └── use-editor-backup-interval.test.tsx
│   │   └── widgets/
│   │       └── __tests__/
│   │           └── book-editor.widget.test.tsx
│   │
│   └── session-library/
│       ├── store/
│       │   └── __tests__/
│       │       └── session-sync.store.test.ts
│       ├── lib/
│       │   └── __tests__/
│       │       └── session-cache.test.ts
│       ├── hooks/
│       │   └── __tests__/
│       │       ├── use-session-library.test.tsx
│       │       └── use-session-sync.test.ts
│       └── widgets/
│           └── __tests__/
│               ├── session-library.widget.test.tsx
│               └── session-sync-banner.widget.test.tsx
│
└── shared/
    ├── hooks/
    │   └── __tests__/
    │       └── (hooks compartilhados)
    ├── lib/
    │   └── __tests__/
    │       ├── permissions.test.ts
    │       ├── anonymous-session.test.ts
    │       └── anonymous-persistence.test.ts
    └── widgets/
        └── __tests__/
            └── (widgets compartilhados)

e2e/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── password-reset.spec.ts
├── explore/
│   ├── book-search.spec.ts
│   ├── favorites.spec.ts
│   └── author-follow.spec.ts
├── library/
│   ├── my-books.spec.ts
│   └── create-book.spec.ts
├── session-library/
│   └── my-session.spec.ts
└── shared/
    └── navigation.spec.ts

vitest.config.ts          ← Configuração Vitest
playwright.config.ts      ← Configuração Playwright
tests/
├── setup.ts              ← Setup global para Vitest
├── utils/                ← Utilitários de teste
│   ├── test-helpers.ts
│   └── render-with-providers.tsx
└── mocks/                ← Mocks reutilizáveis
    ├── zustand.ts
    ├── supabase.ts
    ├── next-router.ts
    └── framer-motion.ts
```

### 3.2 Prioridade de Testes por Feature

| Ordem | Feature | Prioridade | Motivo |
|-------|---------|------------|--------|
| 1 | `session-library` | 🔴 Alta | Solicitado no plano SESSION-LIBRARY-PLAN.md |
| 2 | `auth` | 🔴 Alta | Autenticação é crítica para todas as outras features |
| 3 | `discovery` | 🔴 Alta | Explore é a página principal com mais tráfego |
| 4 | `library` | 🟡 Média | Funcionalidade core para usuários logados |
| 5 | `author-follow` | 🟡 Média | Integra com discovery e library |
| 6 | `book-details` | 🟡 Média | Detalhes de livros e avaliações |
| 7 | `book-dashboard` | 🟡 Média | Dashboard de autor |
| 8 | `editor` | 🟢 Baixa | Funcionalidade avançada para autores |

### 3.3 Convenções

#### Idioma dos Testes

- **TODOS os testes devem ser escritos em INGLÊS**, incluindo:
  - Nomes de `describe` e `it` blocks
  - Mensagens de erro em assertions
  - Comentários em arquivos de teste
  - Nomes de arquivos de teste e diretórios `__tests__`
  - Nomes de variáveis e funções auxiliares de teste
- **Exceção:** Strings de conteúdo da aplicação (ex: mensagens de toast, labels) podem conter português, pois refletem o domínio da aplicação
- **Motivação:** Manter consistência com o padrão do ecossistema JavaScript/TypeScript, facilitar code review, e garantir que desenvolvedores internacionais possam contribuir

#### Estrutura de Testes

- Testes unitários em `__tests__/` junto ao arquivo testado
- Nome do arquivo: `<nome-do-arquivo>.test.ts` ou `<nome-do-arquivo>.test.tsx`
- Um `describe` por entidade (classe, hook, store, componente)
- `it` blocks descritivos no formato "should ..." ou verbo no presente simples

---

## 4. Instalação

### 4.1 Instalar Dependências

```bash
# Testes Unitários
bun add -D vitest @vitest/ui @vitest/coverage-v8
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D jsdom @types/testing-library__jest-dom

# Testes E2E
bun add -D @playwright/test playwright

# Instalar navegadores Playwright
bunx playwright install
```

### 4.2 Adicionar Scripts no package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:codegen": "playwright codegen"
  }
}
```

---

## 5. Configuração Vitest

### 5.1 Arquivo: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/features/**/*', 'src/shared/**/*'],
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/types/**', '**/actions/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 5.2 Arquivo: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    query: {},
    pathname: '/'
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

### 5.3 Arquivo: `tests/mocks/zustand.ts`

```typescript
import { vi } from 'vitest'
import type { StoreApi } from 'zustand'

export function mockStore<T extends object>(
  store: StoreApi<T>,
  mockState: Partial<T>
) {
  const originalState = store.getState()
  store.setState({ ...originalState, ...mockState }, true)
  
  return {
    restore: () => store.setState(originalState, true)
  }
}

export function createMockStoreHook<T extends object>(
  useStore: (selector: (state: T) => any) => any
) {
  return vi.fn().mockImplementation((selector) => 
    selector({} as T)
  )
}
```

---

## 6. Configuração Playwright

### 6.1 Arquivo: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
```

### 6.2 Exemplo: `e2e/my-session.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Minha Sessão - Anônimo', () => {
  test('acessa /my-session sem login', async ({ page }) => {
    await page.goto('/my-session')
    await expect(page).toHaveURL('/my-session')
    await expect(page.getByText('Minha Sessão')).toBeVisible()
  })

  test('mostra empty state quando não há favoritos', async ({ page }) => {
    await page.goto('/my-session')
    await expect(page.getByText('Nenhum livro favoritado')).toBeVisible()
  })

  test('alternar entre abas Favoritos e Autores', async ({ page }) => {
    await page.goto('/my-session')
    await page.getByRole('tab', { name: 'Autores' }).click()
    await expect(page.getByText('Nenhum autor seguido')).toBeVisible()
  })
})

test.describe('Minha Sessão - Favoritar e Ver', () => {
  test('favorita livro no explore e vê em /my-session', async ({ page }) => {
    await page.goto('/explore')
    const firstBook = page.locator('[data-testid="book-card"]').first()
    await firstBook.getByRole('button', { name: 'Favoritar' }).click()
    
    await page.goto('/my-session')
    await expect(page.locator('[data-testid="favorite-book-card"]')).toHaveCount(1)
  })
})
```

---

## 7. Exemplos de Testes Unitários

### 7.1 Teste de Store: `session-sync.store.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionSyncStore } from '../session-sync.store'

describe('session-sync.store', () => {
  beforeEach(() => {
    useSessionSyncStore.getState().reset()
  })

  it('inicializa com estado padrão', () => {
    const state = useSessionSyncStore.getState()
    expect(state.isSyncing).toBe(false)
    expect(state.lastSyncResult).toBeNull()
    expect(state.syncError).toBeNull()
  })

  it('setSyncing altera isSyncing', () => {
    const { setSyncing } = useSessionSyncStore.getState()
    
    setSyncing(true)
    expect(useSessionSyncStore.getState().isSyncing).toBe(true)
    
    setSyncing(false)
    expect(useSessionSyncStore.getState().isSyncing).toBe(false)
  })

  it('setSyncResult armazena resultado', () => {
    const { setSyncResult } = useSessionSyncStore.getState()
    const mockResult = {
      success: true,
      migrated: { favorites: 3, follows: 2, ratings: 0 }
    }
    
    setSyncResult(mockResult as any)
    expect(useSessionSyncStore.getState().lastSyncResult).toEqual(mockResult)
  })
})
```

### 7.2 Teste de Lib: `session-cache.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFromCache, saveToCache, clearCache } from '../session-cache'
import type { SessionCacheData } from '../../types/session-library.types'

const CACHE_KEY = 'session_library_cache'

describe('session-cache', () => {
  const mockSessionId = 'test-session-123'
  const mockData: SessionCacheData = {
    favorites: [],
    authors: [],
    timestamp: Date.now(),
    sessionId: mockSessionId
  }

  beforeEach(() => {
    vi.useFakeTimers()
    clearCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saveToCache armazena dados no localStorage', () => {
    saveToCache(mockData)
    const stored = localStorage.getItem(CACHE_KEY)
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).toEqual(mockData)
  })

  it('getFromCache retorna dados válidos', () => {
    saveToCache(mockData)
    const result = getFromCache(mockSessionId)
    expect(result).toEqual(mockData)
  })

  it('getFromCache retorna null se sessionId diferente', () => {
    saveToCache(mockData)
    const result = getFromCache('different-session')
    expect(result).toBeNull()
  })

  it('getFromCache retorna null se cache expirado', () => {
    saveToCache({ ...mockData, timestamp: Date.now() - 10 * 60 * 1000 })
    const result = getFromCache(mockSessionId)
    expect(result).toBeNull()
  })

  it('clearCache remove dados do localStorage', () => {
    saveToCache(mockData)
    clearCache()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })
})
```

---

## 8. Exemplos Adicionais de Testes para Outras Features

### 8.1 Teste de Permissões: `shared/lib/permissions.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { can, isLazyAction, getAnonymousToastMessage } from './permissions'

describe('permissions', () => {
  describe('can function', () => {
    it('anonymous pode view:books', () => {
      expect(can('anonymous', 'view:books')).toBe(true)
    })

    it('anonymous pode view:session', () => {
      expect(can('anonymous', 'view:session')).toBe(true)
    })

    it('anonymous NÃO pode library:personal', () => {
      expect(can('anonymous', 'library:personal')).toBe(false)
    })

    it('reader pode library:personal', () => {
      expect(can('reader', 'library:personal')).toBe(true)
    })

    it('author pode create:book', () => {
      expect(can('author', 'create:book')).toBe(true)
    })
  })

  describe('isLazyAction', () => {
    it('follow:author é lazy', () => {
      expect(isLazyAction('follow:author')).toBe(true)
    })

    it('view:books NÃO é lazy', () => {
      expect(isLazyAction('view:books')).toBe(false)
    })
  })

  describe('getAnonymousToastMessage', () => {
    it('retorna mensagem para favorite:book', () => {
      const message = getAnonymousToastMessage('favorite:book')
      expect(message).toContain('favoritado')
    })
  })
})
```

### 8.2 Teste de Hook: `discovery/hooks/use-favorites.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './use-favorites'
import { useFavoritesStore } from '@/shared/store/favorites.store'

vi.mock('@/shared/store/favorites.store', () => ({
  useFavoritesStore: vi.fn()
}))

describe('useFavorites hook', () => {
  const mockFavoritedIds = new Set(['book-1', 'book-2'])
  const mockAddFavorite = vi.fn()
  const mockRemoveFavorite = vi.fn()
  const mockToggleFavorite = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useFavoritesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        favoritedIds: mockFavoritedIds,
        addFavorite: mockAddFavorite,
        removeFavorite: mockRemoveFavorite,
        toggleFavorite: mockToggleFavorite
      })
    )
  })

  it('retorna favoritedIds do store', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favoritedIds).toEqual(mockFavoritedIds)
  })

  it('isFavorite retorna true para livro favoritado', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.isFavorite('book-1')).toBe(true)
  })

  it('isFavorite retorna false para livro não favoritado', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.isFavorite('book-999')).toBe(false)
  })
})
```

### 8.3 Teste E2E Auth: `e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Autenticação - Login', () => {
  test('página de login carrega corretamente', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
  })

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('email@invalido.com')
    await page.getByLabel('Senha').fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Credenciais inválidas')).toBeVisible()
  })

  test('link para registro existe', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.getByRole('link', { name: 'Criar conta' })
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    await expect(page).toHaveURL('/register')
  })
})
```

### 8.4 Teste E2E Explore: `e2e/explore/favorites.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Explore - Favoritos', () => {
  test('usuário anônimo pode favoritar livro', async ({ page }) => {
    await page.goto('/explore')
    const firstBook = page.locator('[data-testid="book-card"]').first()
    const favoriteButton = firstBook.getByRole('button', { name: 'Favoritar' })
    
    await expect(favoriteButton).toBeVisible()
    await favoriteButton.click()
    await expect(page.getByText('favoritado')).toBeVisible()
  })
})
```

---

## 9. Checklist de Configuração

### 9.1 Instalação

- [ ] Instalar vitest e dependências
- [ ] Instalar @testing-library/react, jest-dom, user-event
- [ ] Instalar jsdom
- [ ] Instalar @playwright/test
- [ ] Executar `playwright install`

### 9.2 Configuração

- [ ] Criar `vitest.config.ts`
- [ ] Criar `tests/setup.ts`
- [ ] Criar `tests/utils/render-with-providers.tsx`
- [ ] Criar `tests/mocks/` com mocks comuns
- [ ] Criar `playwright.config.ts`
- [ ] Adicionar scripts no `package.json`

### 9.3 Testes Unitários - Todas as Features

> **Legenda:** ✅ Concluído · ⏭️ Pulado (server action com `new`) · ⏸️ Adiado (complexidade)

#### 🔴 Alta Prioridade

##### Session Library
- [x] `session-library/store/__tests__/session-sync.store.test.ts`
- [x] `session-library/lib/__tests__/session-cache.test.ts`
- [x] `session-library/hooks/__tests__/use-session-library.test.tsx`
- [x] `session-library/hooks/__tests__/use-session-sync.test.ts`
- [x] `session-library/widgets/__tests__/session-library.widget.test.tsx`
- [x] `session-library/widgets/__tests__/session-sync-banner.widget.test.tsx`

##### Auth
- [x] `auth/hooks/__tests__/use-auth.test.tsx`
- [x] `auth/widgets/__tests__/login-form.widget.test.tsx`
- [x] `auth/widgets/__tests__/register-form.widget.test.tsx`
- [x] `auth/actions/__tests__/migrate-session-data.action.test.ts`

##### Discovery
- [x] `discovery/hooks/__tests__/use-favorites.test.tsx`
- [x] `discovery/data/__tests__/search-books.test.ts` ⏭️ (server action com `new`)
- [x] `discovery/widgets/__tests__/landing-header.widget.test.tsx`

##### Shared (Libs Compartilhadas)
- [x] `shared/lib/__tests__/permissions.test.ts`
- [x] `shared/lib/__tests__/anonymous-session.test.ts`
- [x] `shared/lib/__tests__/anonymous-persistence.test.ts`

#### 🟡 Média Prioridade

##### Library
- [x] `library/hooks/__tests__/use-user-books.test.tsx`
- [x] `library/widgets/__tests__/library-content.widget.test.tsx`
- [x] `library/widgets/__tests__/create-book-modal.widget.test.tsx`

##### Author Follow
- [x] `author-follow/hooks/__tests__/use-author-follow.test.tsx`
- [x] `author-follow/actions/__tests__/author-follow.actions.test.ts` ⏭️ (server action)
- [x] `author-follow/hooks/__tests__/use-author-follow-initialized.test.tsx`
- [x] `author-follow/widgets/__tests__/author-follow.widget.test.tsx`

##### Book Details
- [x] `book-details/ui/__tests__/rating-stars.ui.test.tsx`
- [x] `book-details/ui/__tests__/metrics-card.ui.test.tsx`
- [x] `book-details/ui/__tests__/rating-input.ui.test.tsx`
- [x] `book-details/widgets/__tests__/book-details-panel.widget.test.tsx`
- [ ] `book-details/actions/__tests__/rate-book.action.test.ts` ⏭️ (server action)

##### Book Dashboard
- [x] `book-dashboard/ui/__tests__/book-card.ui.test.tsx`
- [x] `book-dashboard/store/__tests__/create-book-modal.store.test.ts`
- [x] `book-dashboard/hooks/__tests__/use-books.test.tsx`
- [ ] `book-dashboard/data/__tests__/cached-books.test.ts` ⏭️ (`"use cache"` directive)

#### 🟢 Baixa Prioridade

##### Editor ⏸️ Adiado
- [ ] `editor/hooks/__tests__/use-editor.test.tsx`
- [ ] `editor/hooks/__tests__/use-editor-backup-interval.test.tsx`
- [ ] `editor/widgets/__tests__/book-editor.widget.test.tsx`

### 9.4 Testes E2E — ⏸️ Adiado (requer setup de ambiente + banco)

- [ ] `e2e/session-library/my-session.spec.ts`
- [ ] `e2e/auth/login.spec.ts`
- [ ] `e2e/auth/register.spec.ts`
- [ ] `e2e/explore/book-search.spec.ts`
- [ ] `e2e/explore/favorites.spec.ts`
- [ ] `e2e/library/my-books.spec.ts`
- [ ] `e2e/library/create-book.spec.ts`
- [ ] `e2e/explore/author-follow.spec.ts`
- [ ] `e2e/shared/navigation.spec.ts`
- [ ] `e2e/auth/password-reset.spec.ts`
- [ ] `e2e/editor/write-book.spec.ts`

---

## 10. Como Rodar os Testes

```bash
# Testes unitários (modo watch)
bun run test

# Testes unitários (rodar uma vez)
bun run test:run

# Testes unitários com cobertura
bun run test:coverage

# Testes com UI
bun run test:ui

# Rodar testes de uma feature específica
bun run test src/features/session-library

# Testes E2E
bun run e2e

# Testes E2E com UI
bun run e2e:ui

# Testes E2E de um arquivo específico
bun run e2e e2e/session-library/my-session.spec.ts

# Testes E2E com navegador específico
bun run e2e --project=chromium
```

---

## 11. Pipeline de Qualidade

### 11.1 Ordem Recomendada de Execução

```
1. bun run lint          ← Verificar estilo de código
2. bun run test:run      ← Testes unitários
3. bun run test:coverage ← Cobertura de código
4. bun run build         ← Build de produção
5. bun run e2e           ← Testes E2E (após build)
```

### 11.2 Metas de Cobertura

| Métrica | Meta |
|---------|------|
| Linhas | > 70% |
| Funções | > 70% |
| Branches | > 60% |
| Statements | > 70% |

---

## 12. Referências

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)
- **Plano Relacionado:** `SESSION-LIBRARY-PLAN.md` (Sprint 3 - Testes)

---

## 13. Features Cobertas

Este plano cobre **TODAS** as features do projeto:

| Feature | Pasta | Status dos Testes | Testes |
|---------|-------|-------------------|--------|
| Session Library | `src/features/session-library/` | ✅ Completo | 40 |
| Auth | `src/features/auth/` | ✅ Completo | 39 |
| Discovery | `src/features/discovery/` | ✅ Completo (1 skip) | 18 |
| Shared Libs | `src/shared/lib/` | ✅ Completo | 30 |
| Library | `src/features/library/` | ✅ Completo | 45 |
| Author Follow | `src/features/author-follow/` | ✅ Completo (1 skip) | 28 |
| Book Details | `src/features/book-details/` | 🟡 Parcial (1 skip) | 19 |
| Book Dashboard | `src/features/book-dashboard/` | 🟡 Parcial (1 skip) | 32 |
| Editor | `src/features/editor/` | ⏸️ Adiado | — |
| E2E | `e2e/` | ⏸️ Adiado | — |
| Profile | `src/features/profile/` | 🔴 Não iniciado (fora do escopo) | — |
| **Total** | | | **259** |
