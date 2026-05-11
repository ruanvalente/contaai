# Plano de Implementação: Minha Sessão (Session Library)

**Versão:** 1.0
**Data:** 08/05/2026
**Status:** Pendente
**Sprints:** 3

---

## Sumário

- [1. Objetivo](#1-objetivo)
- [2. Decisões Arquiteturais](#2-decisões-arquiteturais)
- [3. Sprint 1 — Fundação (Data Layer)](#3-sprint-1--fundação-data-layer)
- [4. Sprint 2 — UI + Rota /my-session](#4-sprint-2--ui--rota-my-session)
- [5. Sprint 3 — Sincronização + Testes + Polimento](#5-sprint-3--sincronização--testes--polimento)
- [6. Estrutura de Arquivos Final](#6-estrutura-de-arquivos-final)
- [7. Matriz de Permissões Atualizada](#7-matriz-de-permissões-atualizada)
- [8. Riscos e Mitigações](#8-riscos-e-mitigações)
- [9. Critérios de Sucesso](#9-critérios-de-sucesso)
- [10. Fluxos Completos](#10-fluxos-completos)

---

## 1. Objetivo

Criar a rota pública `/my-session` onde usuários anônimos visualizam:

- Livros que favoritaram
- Autores que seguem

**Princípios:**

- Zero dependência de login
- Reuso máximo das fases 1-4 existentes
- Persistência híbrida: Supabase + localStorage + Zustand
- Sincronização automática no login (já implementada)

### O Que NÃO Será Feito

- Dashboard de biblioteca (já existe para logados em `/dashboard/library`)
- Edição de conteúdo
- Biblioteca premium / downloads
- Histórico de leitura (futuro)

---

## 2. Decisões Arquiteturais

| Decisão              | Escolha                                                    | Justificativa                                 |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| **Rota**             | `/my-session`                                              | Curta, semântica, consistente com `/explore`  |
| **Acesso no header** | Apenas no landing page e `/explore`                        | Manter header do dashboard limpo para logados |
| **Permissão**        | `view:session` adicionada à matriz                         | Consistente com o sistema existente           |
| **Offline**          | Híbrido: Supabase → localStorage cache → store memória     | Resiliência sem complexidade excessiva        |
| **Cache local**      | localStorage com TTL 5 min                                 | Balance entre frescor e performance           |
| **Sync**             | Reuso de `migrateSessionDataAction` + `syncPendingActions` | Já implementado e testado                     |

### Arquitetura de Dados

```
[User Action] → Zustand Store (instantâneo)
                     ↓
              Server Action (Supabase)
                     ↓
              localStorage Cache (fallback)
```

### Estratégia de Fallback

```
1. Store em memória (Zustand) — se dados já carregados
2. Cache localStorage — se TTL < 5 min e online
3. Supabase — sempre como fonte da verdade
4. Offline → cache localStorage (TTL estendido para 24h)
```

---

## 3. Sprint 1 — Fundação (Data Layer)

**Duração estimada:** 2-3 dias
**Prioridade:** 🔴 Alta
**Dependências:** Fases 1-4 completas
**Risco:** 🔵 Baixo

### 3.1 Feature Folder + Types

Criar estrutura inicial do feature:

```txt
src/features/session-library/
├── types/
│   └── session-library.types.ts
├── store/
│   └── session-sync.store.ts
├── actions/
│   ├── index.ts
│   ├── get-session-favorites.action.ts
│   ├── get-session-followed-authors.action.ts
│   └── clear-session.action.ts
├── lib/
│   └── session-cache.ts
├── hooks/
│   ├── index.ts
│   ├── use-session-library.ts
│   └── use-session-sync.ts
├── ui/
│   ├── session-hero.ui.tsx
│   ├── session-tabs.ui.tsx
│   ├── favorite-book-card.ui.tsx
│   ├── followed-author-card.ui.tsx
│   ├── empty-favorites.ui.tsx
│   └── empty-authors.ui.tsx
└── widgets/
    ├── session-library.widget.tsx
    ├── session-favorites-list.widget.tsx
    ├── session-authors-list.widget.tsx
    └── session-sync-banner.widget.tsx
```

### 3.2 Types — `session-library.types.ts`

```typescript
export type SessionFavoriteBook {
  id: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCoverUrl: string | null
  bookCoverColor: string | null
  bookCategory: string | null
  favoritedAt: string
}

export type SessionFollowedAuthor {
  authorName: string
  avatarUrl: string | null
  bio: string | null
  booksCount: number
  followedAt: string
}

export type SessionCacheData {
  favorites: SessionFavoriteBook[]
  authors: SessionFollowedAuthor[]
  timestamp: number
  sessionId: string
}

export type SessionTab = 'favorites' | 'authors'
```

### 3.3 Store — `session-sync.store.ts`

```typescript
// Estado do processo de sincronização Session → User
// Usado pelo SessionSyncBanner para mostrar progresso

type SessionSyncState {
  isSyncing: boolean
  lastSyncResult: MigrationResult | null
  syncError: string | null
  sync: (sessionId: string) => Promise<void>
  reset: () => void
}
```

### 3.4 Server Actions

#### `get-session-favorites.action.ts`

```typescript
"use server";
// Reusa getUserFavorites(sessionId) da favorites.actions.ts
// Retorna SessionFavoriteBook[] (já temos esses dados na tabela user_favorites)
// Se autenticado, busca por user_id
// Se anônimo, busca por session_id

// Edge cases:
// - sessionId vazio → retorna []
// - Nenhum favorito → retorna []
// - Usuário logado sem sessionId → busca por user_id
```

#### `get-session-followed-authors.action.ts`

```typescript
"use server";
// Reusa getFollowedAuthorsByUser(userId?, sessionId?)
// MAS enriquece com dados de profile (avatar, bio) e book count
// Query: LEFT JOIN profiles + LEFT JOIN user_books
// Retorna SessionFollowedAuthor[]

// Edge cases:
// - sessionId vazio → retorna []
// - Autor sem profile (nome não cadastrado como user) → nome apenas, sem avatar/bio
```

#### `clear-session.action.ts`

```typescript
"use server";
// Limpa dados de sessão do banco
// Usado quando usuário explícitamente quer "nova sessão"
// Mantém localStorage (limpo pelo client)
```

### 3.5 Cache Local — `session-cache.ts`

```typescript
const CACHE_KEY = "session_library_cache";
const CACHE_TTL_ONLINE = 5 * 60 * 1000; // 5 min
const CACHE_TTL_OFFLINE = 24 * 60 * 60 * 1000; // 24h

// saveToCache(data, sessionId)
// getFromCache(sessionId): SessionCacheData | null
// clearCache()
// isOnline(): boolean (navigator.onLine)
```

### 3.6 Migration SQL — Novo Índice

```sql
-- 032_add_session_library_indexes.sql

-- Índice para busca de favoritos por sessão
CREATE INDEX IF NOT EXISTS idx_user_favorites_session_lookup
ON user_favorites(session_id) WHERE user_id IS NULL;

-- Índice para busca de follows por sessão
CREATE INDEX IF NOT EXISTS idx_author_follow_session_lookup
ON author_follow(session_id) WHERE user_id IS NULL;

-- Índice composto para enriquecer dados de autor
CREATE INDEX IF NOT EXISTS idx_profiles_name_lookup
ON profiles(LOWER(name));

CREATE INDEX IF NOT EXISTS idx_user_books_author_lookup
ON user_books(LOWER(author)) WHERE status = 'published';
```

### Arquivos da Sprint 1

| Arquivo                                                                       | Ação      |
| ----------------------------------------------------------------------------- | --------- |
| `src/features/session-library/types/session-library.types.ts`                 | **Criar** |
| `src/features/session-library/store/session-sync.store.ts`                    | **Criar** |
| `src/features/session-library/actions/index.ts`                               | **Criar** |
| `src/features/session-library/actions/get-session-favorites.action.ts`        | **Criar** |
| `src/features/session-library/actions/get-session-followed-authors.action.ts` | **Criar** |
| `src/features/session-library/actions/clear-session.action.ts`                | **Criar** |
| `src/features/session-library/lib/session-cache.ts`                           | **Criar** |
| `src/features/session-library/hooks/index.ts`                                 | **Criar** |
| `supabase/migrations/032_add_session_library_indexes.sql`                     | **Criar** |

### Validação Sprint 1

- [ ] Tipos compilam sem erros
- [ ] Server actions retornam dados corretos (testar via browser)
- [ ] Cache localStorage funciona (set/get/clear)
- [ ] Store Zustand inicializa corretamente
- [ ] Migração SQL roda sem erros

---

## 4. Sprint 2 — UI + Rota /my-session

**Duração estimada:** 3-4 dias
**Prioridade:** 🔴 Alta
**Dependências:** Sprint 1
**Risco:** 🟡 Médio (decisões de UX)

### 4.1 Rota /my-session

#### `src/app/my-session/page.tsx`

Server Component — layout básico, sem fetch (dados são client-side):

```typescript
import { Metadata } from 'next'
import { Container } from '@/shared/ui/container.ui'
import { SessionLibraryWidget } from '@/features/session-library/widgets/session-library.widget'

export const metadata: Metadata = {
  title: 'Minha Sessão | Conta.AI',
  description: 'Seus livros favoritados e autores seguidos.',
}

export default function MySessionPage() {
  return (
    <main className="min-h-screen bg-primary-200">
      <Container className="py-20">
        <SessionLibraryWidget />
      </Container>
    </main>
  )
}
```

#### `src/app/my-session/loading.tsx`

```typescript
// Skeleton matching o layout da página
export default function Loading() {
  return (
    <main className="min-h-screen bg-primary-200">
      <Container className="py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-primary-300 rounded-xl" />
          <div className="h-10 bg-primary-300 rounded-lg w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-primary-300 rounded-xl" />
            ))}
          </div>
        </div>
      </Container>
    </main>
  )
}
```

### 4.2 Hooks

#### `use-session-library.ts`

Hook principal que orquestra todo o estado da página:

```
Estado:
  - activeTab: 'favorites' | 'authors'
  - favorites: SessionFavoriteBook[]  (via useFavoritesStore)
  - authors: SessionFollowedAuthor[]  (via useAuthorFollowStore + get-session-followed-authors)
  - isLoading, isLoaded, isAuthenticated

Comportamento:
  - Inicializa hooks existentes (useFavorites, useAuthorFollowStore)
  - Se autenticado: busca por user_id
  - Se anônimo: busca por session_id
  - Se cache local disponível e válido: mostra imediatamente, revalida em bg
  - Alterna entre abas sem recarregar dados
  - Expõe handlers para refetch
```

### 4.3 UI Components

#### `session-hero.ui.tsx`

Banner superior da página:

```
┌─────────────────────────────────────────────┐
│  [BookHeart icon]  Minha Sessão             │
│  Seus favoritos e autores, salvos aqui.     │
│                                             │
│  [ Se não logado ]                          │
│  "Faça login para sincronizar seus dados"   │
│  [Fazer login] [Criar conta]                │
│                                             │
│  [ Se logado ]                              │
│  "✅ Dados sincronizados com sua conta"     │
│  [Ir para Dashboard]                        │
└─────────────────────────────────────────────┘
```

**Estados:**

- `variant: 'anonymous'` — mostra CTAs de login
- `variant: 'authenticated'` — mostra badge de sync + link dashboard
- `variant: 'syncing'` — mostra spinner + "Sincronizando..."

#### `session-tabs.ui.tsx`

Abas para alternar entre Favoritos e Autores:

```typescript
interface SessionTabsProps {
  activeTab: SessionTab;
  onTabChange: (tab: SessionTab) => void;
  favoritesCount: number;
  authorsCount: number;
}
```

**Design:**

- Abas estilizadas consistentes com `tabs.ui.tsx` existente
- Badge com contagem em cada aba
- Transição suave (framer-motion)

#### `favorite-book-card.ui.tsx`

Card de livro favoritado:

```typescript
type FavoriteBookCardProps {
  book: SessionFavoriteBook
  onRemove?: (bookId: string) => void
}
```

**Layout:**

```
┌──────────────────┐
│    [Book Cover]   │
│                   │
│   Título do Livro │
│   Nome do Autor   │
│   ★★★★★           │
│   [Remover]       │
└──────────────────┘
```

- Reusa `BookCover` de `shared/ui/book-cover.ui.tsx`
- Link para `/book/{id}`
- Botão "Remover dos favoritos" (com confirmação)

#### `followed-author-card.ui.tsx`

Card de autor seguido:

```typescript
type FollowedAuthorCardProps {
  author: SessionFollowedAuthor
  onUnfollow?: (authorName: string) => void
}
```

**Layout:**

```
┌────────────────────────────────┐
│ [Avatar]  Nome do Autor        │
│           Bio resumida...      │
│           5 livros publicados  │
│           [Seguindo ▼]        │
└────────────────────────────────┘
```

- Avatar com fallback para iniciais
- Bio truncada em 2 linhas
- Contagem de livros
- Botão "Deixar de seguir" (com confirmação)

#### `empty-favorites.ui.tsx` e `empty-authors.ui.tsx`

Estados vazios com ilustração + CTA:

```
┌────────────────────────────────┐
│       [Illustration]           │
│                                │
│   Nenhum livro favoritado      │
│   ainda.                       │
│                                │
│   [Explorar Livros →]         │
└────────────────────────────────┘
```

- Ilustração com `lucide-react` (Heart para favorites, Users para authors)
- Link para `/explore`
- Mensagem amigável

### 4.4 Widgets

#### `session-library.widget.tsx`

Container principal — 'use client':

```
<SessionHero variant={isAuthenticated ? 'authenticated' : 'anonymous'} />
<SessionTabs activeTab={...} onTabChange={...} />
{isLoading && <SkeletonGrid />}
{activeTab === 'favorites' && <SessionFavoritesList />}
{activeTab === 'authors' && <SessionAuthorsList />}
<SessionSyncBanner />  {/* só aparece durante sync */}
```

#### `session-favorites-list.widget.tsx`

Lista de favoritos com grid:

```
// Se vazio: <EmptyFavorites />
// Se tem dados:
<BookGrid>
  {favorites.map(book => <FavoriteBookCard key={book.id} book={book} />)}
</BookGrid>
```

#### `session-authors-list.widget.tsx`

Lista de autores com grid:

```
// Se vazio: <EmptyAuthors />
// Se tem dados:
<AuthorGrid>
  {authors.map(author => <FollowedAuthorCard key={author.authorName} author={author} />)}
</AuthorGrid>
```

### 4.5 Permissions — Adicionar `view:session`

Modificar `src/shared/lib/permissions.ts`:

```typescript
export type Action =
  | 'view:books'
  | 'view:session'              // ← NOVO
  | 'read:published'
  | 'search:books'
  | 'follow:author'
  | 'rate:book'
  | 'favorite:book'
  | 'library:personal'
  | 'download:book'
  | 'create:book'
  | 'edit:book'

const PERMISSIONS: Record<UserRole, Set<Action>> = {
  anonymous: new Set([
    'view:books',
    'view:session',             // ← NOVO
    'read:published',
    'search:books',
    'follow:author',
    'rate:book',
    'favorite:book',
  ]),
  // reader e author também herdam por terem 'library:personal'
  // que é um superset de 'view:session'
  ...
}
```

### 4.6 Middleware — Adicionar `/my-session` às rotas públicas

Modificar `src/proxy.ts`:

```typescript
const publicPaths = [
  "/",
  "/explore",
  "/my-session",         // ← NOVO
  "/landingpage",
  "/login",
  "/register",
  ...
];
```

### 4.7 Navegação — Adicionar link no Landing Header

Modificar `src/features/discovery/widgets/landing-header.widget.tsx`:

```typescript
const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Explorar", href: "/explore" },
  { label: "Minha Sessão", href: "/my-session" }, // ← NOVO
  { label: "Comunidade", href: "#community" },
  { label: "Contribuir", href: "#contributes" },
];
```

**Nota:** O link "Sessão" aparece APENAS no header do landing page (`/`) e no `/explore`. Não aparece no dashboard header.

### 4.8 Tratamento de Hydration Mismatch

Como `session_id` só existe no client, o `SessionLibraryWidget` deve usar `dynamic import` com `ssr: false` OU usar o hook `useHydrated()` existente:

```typescript
// app/my-session/page.tsx
import dynamic from "next/dynamic";

const SessionLibraryWidget = dynamic(
  () =>
    import("@/features/session-library/widgets/session-library.widget").then(
      (mod) => mod.SessionLibraryWidget,
    ),
  { ssr: false },
);
```

### Arquivos da Sprint 2

| Arquivo                                                                  | Ação                                        |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| `src/app/my-session/page.tsx`                                            | **Criar**                                   |
| `src/app/my-session/loading.tsx`                                         | **Criar**                                   |
| `src/features/session-library/hooks/use-session-library.ts`              | **Criar**                                   |
| `src/features/session-library/ui/session-hero.ui.tsx`                    | **Criar**                                   |
| `src/features/session-library/ui/session-tabs.ui.tsx`                    | **Criar**                                   |
| `src/features/session-library/ui/favorite-book-card.ui.tsx`              | **Criar**                                   |
| `src/features/session-library/ui/followed-author-card.ui.tsx`            | **Criar**                                   |
| `src/features/session-library/ui/empty-favorites.ui.tsx`                 | **Criar**                                   |
| `src/features/session-library/ui/empty-authors.ui.tsx`                   | **Criar**                                   |
| `src/features/session-library/widgets/session-library.widget.tsx`        | **Criar**                                   |
| `src/features/session-library/widgets/session-favorites-list.widget.tsx` | **Criar**                                   |
| `src/features/session-library/widgets/session-authors-list.widget.tsx`   | **Criar**                                   |
| `src/shared/lib/permissions.ts`                                          | **Modificar** (add `view:session`)          |
| `src/proxy.ts`                                                           | **Modificar** (add `/my-session` as public) |
| `src/features/discovery/widgets/landing-header.widget.tsx`               | **Modificar** (add nav item)                |

### Validação Sprint 2

- [ ] `/my-session` acessível sem login (sem redirect)
- [ ] `/my-session` não quebra para usuários logados
- [ ] Skeleton aparece durante carregamento
- [ ] Estado vazio mostra mensagens corretas
- [ ] Abas alternam entre Favoritos e Autores
- [ ] Hero mostra CTAs corretos (anônimo vs logado)
- [ ] Link "Minha Sessão" aparece no landing header
- [ ] `bun run build` passa sem erros
- [ ] `bun run lint` sem warnings

---

## 5. Sprint 3 — Sincronização + Testes + Polimento

**Duração estimada:** 3-4 dias
**Prioridade:** 🟡 Média
**Dependências:** Sprint 2
**Risco:** 🟡 Médio (race conditions)

### 5.1 Hook `use-session-sync.ts`

Monitora transição anônimo → logado e dispara sync:

```typescript
type UseSessionSyncReturn {
  isSyncing: boolean
  lastSyncResult: MigrationResult | null
  triggerSync: () => Promise<void>
}

function useSessionSync(): UseSessionSyncReturn {
  // Monitora useAuthStore para detectar login
  // Quando user passa de null → {id}:
  //   1. Chama migrateSessionDataAction(sessionId)
  //   2. Chama syncPendingActions(userId) (fallback)
  //   3. Atualiza sessionSyncStore com resultado
  //   4. Dispara toast de sucesso/erro
  //   5. Recarrega dados da página (agora por user_id)
}
```

### 5.2 Widget `session-sync-banner.widget.tsx`

Banner mostrado durante e após sincronização:

```
┌─ Sync em andamento ────────────────────┐
│  ⟳ Sincronizando seus dados...        │
│  [Progress: follows ✓, favorites ✓]    │
└─────────────────────────────────────────┘

┌─ Sync concluído ───────────────────────┐
│  ✅ Dados sincronizados! Agora seus    │
│     favoritos estão na sua conta.      │
│  [Ir para Dashboard] [Fechar]          │
└─────────────────────────────────────────┘
```

**Comportamento:**

- Aparece automaticamente após login
- Auto-dismiss após 8 segundos (ou até fechar)
- Persiste resultado em `sessionSyncStore` para não repetir

### 5.3 Integração com Login

**Disparar sync no login:**
No `useAuthRedirect` ou em um `useEffect` no `SessionLibraryWidget` que monitora `useAuthStore`:

```typescript
useEffect(() => {
  const prevUserRef = useRef(prevUser);

  if (!prevUserRef.current && user && sessionId) {
    // Transição anônimo → logado
    triggerSync(sessionId);
  }
  prevUserRef.current = user;
}, [user]);
```

### 5.4 Multi-Tab Sync (BroadcastChannel)

```typescript
// Em use-session-library.ts

useEffect(() => {
  if (typeof window === "undefined") return;

  const channel = new BroadcastChannel("session-library");

  channel.onmessage = (event) => {
    if (
      event.data.type === "favorite:added" ||
      event.data.type === "favorite:removed"
    ) {
      refetchFavorites();
    }
    if (
      event.data.type === "follow:added" ||
      event.data.type === "follow:removed"
    ) {
      refetchAuthors();
    }
  };

  return () => channel.close();
}, []);
```

**Nota:** O BroadcastChannel é um adicional opcional. O comportamento base (recarregar ao focar a aba) já é suficiente na maioria dos casos.

### 5.5 Testes

#### Testes Unitários

```
src/features/session-library/
├── types/
│   └── session-library.types.ts          (tipos estáticos — sem teste)
├── store/
│   └── __tests__/
│       └── session-sync.store.test.ts
├── lib/
│   └── __tests__/
│       └── session-cache.test.ts
├── hooks/
│   └── __tests__/
│       └── use-session-library.test.tsx
└── widgets/
    └── __tests__/
        └── session-library.widget.test.tsx
```

**Cenários obrigatórios:**

| #   | Teste                                           | Tipo        |
| --- | ----------------------------------------------- | ----------- |
| 1   | Store inicializa com `isSyncing: false`         | Unit        |
| 2   | `sync()` muda para `isSyncing: true`            | Unit        |
| 3   | `sync()` bem-sucedido preenche `lastSyncResult` | Unit        |
| 4   | Cache salva e restaura dados corretamente       | Unit        |
| 5   | Cache expirado retorna null                     | Unit        |
| 6   | Cache com sessionId diferente retorna null      | Unit        |
| 7   | Hook carrega favoritos de sessão anônima        | Integration |
| 8   | Hook carrega autores seguidos de sessão anônima | Integration |
| 9   | Hook alterna entre abas sem recarregar          | Integration |
| 10  | Empty state aparece quando não há dados         | Integration |

#### Testes de Integração (Sync)

| #   | Cenário                 | Descrição                                                            |
| --- | ----------------------- | -------------------------------------------------------------------- |
| 1   | Migração Session → User | Anônimo com 3 favoritos faz login → dados migrados para user_id      |
| 2   | Sem dados para migrar   | Anônimo sem interações faz login → sync retorna 0                    |
| 3   | Duplicidade no merge    | Anônimo favorita livro X, user já tinha X favoritado → sem duplicata |
| 4   | Pending action + RPC    | Anônimo favorita offline, pending action salva, login executa sync   |
| 5   | Erro no RPC             | RPC falha → pending actions retentam → toast de erro                 |

#### Testes E2E (Playwright)

```
e2e/my-session.spec.ts
```

| #   | Teste           | Descrição                                                                         |
| --- | --------------- | --------------------------------------------------------------------------------- |
| 1   | Acesso anônimo  | Navega para /my-session sem login, vê página sem redirect                         |
| 2   | Favoritar e ver | Favorita livro no /explore, navega /my-session, vê o livro                        |
| 3   | Seguir e ver    | Segue autor, navega /my-session, vê o autor                                       |
| 4   | Login e sync    | Anônimo com dados → login → dados persistem em /my-session e /dashboard/favorites |
| 5   | Refresh         | Favorita, recarrega página, favorito ainda aparece                                |
| 6   | Multi-tab       | Aba A: favorita. Aba B: recarrega e vê (BroadcastChannel ou polling)              |

### 5.6 Edge Cases Tratados

| #   | Problema                               | Solução                                                       |
| --- | -------------------------------------- | ------------------------------------------------------------- |
| 1   | Race condition: favoritar durante sync | Bloquear botões de ação enquanto `isSyncing === true`         |
| 2   | Sessão expirada (>30 dias no banco)    | Ignorar dados antigos no fallback; mostrar apenas cache local |
| 3   | Usuário logado nunca foi anônimo       | Sync não encontra dados para migrar → tudo normal             |
| 4   | Aba aberta antes e depois do sync      | `SessionSyncBanner` persiste resultado para não repetir toast |
| 5   | Cache corrompido (JSON inválido)       | `try/catch` → limpa cache → busca do Supabase                 |

### 5.7 Animações e Transições

Usar `framer-motion` (já existente no projeto):

- Cards de livro: `stagger` reveal (50ms delay entre cada)
- Abas: `layoutId` para animação de indicador
- Empty states: fade in suave
- Sync banner: slide down + fade out

### Arquivos da Sprint 3

| Arquivo                                                                          | Ação      |
| -------------------------------------------------------------------------------- | --------- |
| `src/features/session-library/hooks/use-session-sync.ts`                         | **Criar** |
| `src/features/session-library/widgets/session-sync-banner.widget.tsx`            | **Criar** |
| `src/features/session-library/store/__tests__/session-sync.store.test.ts`        | **Criar** |
| `src/features/session-library/lib/__tests__/session-cache.test.ts`               | **Criar** |
| `src/features/session-library/hooks/__tests__/use-session-library.test.tsx`      | **Criar** |
| `src/features/session-library/widgets/__tests__/session-library.widget.test.tsx` | **Criar** |
| `e2e/my-session.spec.ts`                                                         | **Criar** |

### Validação Sprint 3

- [ ] Sync automático no login (anônimo → logado)
- [ ] Banner de sync aparece e desaparece
- [ ] Toast de sucesso/erro no sync
- [ ] Multi-tab funcional (BroadcastChannel)
- [ ] Testes unitários passam
- [ ] Testes E2E passam
- [ ] Edge cases cobertos (sessão expirada, cache corrompido, race condition)
- [ ] `bun run build` passa

---

## 6. Estrutura de Arquivos Final

```
src/
├── app/
│   ├── my-session/                         # NOVO
│   │   ├── page.tsx                        # Server Component (layout + dynamic import)
│   │   └── loading.tsx                     # Skeleton
│   └── ... (demais rotas inalteradas)
│
├── features/
│   ├── session-library/                    # NOVO
│   │   ├── types/
│   │   │   └── session-library.types.ts
│   │   ├── store/
│   │   │   ├── session-sync.store.ts
│   │   │   └── __tests__/
│   │   │       └── session-sync.store.test.ts
│   │   ├── actions/
│   │   │   ├── index.ts
│   │   │   ├── get-session-favorites.action.ts
│   │   │   ├── get-session-followed-authors.action.ts
│   │   │   └── clear-session.action.ts
│   │   ├── lib/
│   │   │   ├── session-cache.ts
│   │   │   └── __tests__/
│   │   │       └── session-cache.test.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-session-library.ts
│   │   │   ├── use-session-sync.ts
│   │   │   └── __tests__/
│   │   │       └── use-session-library.test.tsx
│   │   ├── ui/
│   │   │   ├── session-hero.ui.tsx
│   │   │   ├── session-tabs.ui.tsx
│   │   │   ├── favorite-book-card.ui.tsx
│   │   │   ├── followed-author-card.ui.tsx
│   │   │   ├── empty-favorites.ui.tsx
│   │   │   └── empty-authors.ui.tsx
│   │   └── widgets/
│   │       ├── session-library.widget.tsx
│   │       ├── session-favorites-list.widget.tsx
│   │       ├── session-authors-list.widget.tsx
│   │       ├── session-sync-banner.widget.tsx
│   │       └── __tests__/
│   │           └── session-library.widget.test.tsx
│   │
│   ├── discovery/                          # EXISTENTE (inalterado)
│   ├── author-follow/                      # EXISTENTE (reusado)
│   └── ... (demais features inalteradas)
│
├── shared/
│   ├── lib/
│   │   └── permissions.ts                  # MODIFICADO (add view:session)
│   └── ... (demais shared inalterados)
│
├── proxy.ts                                # MODIFICADO (add /my-session)
│
└── ... (demais arquivos inalterados)
```

**Total de arquivos novos:** 20
**Total de arquivos modificados:** 3 (permissions.ts, proxy.ts, landing-header.widget.tsx)

---

## 7. Matriz de Permissões Atualizada

| Ação               | Anônimo | Leitor | Autor |
| ------------------ | :-----: | :----: | :---: |
| `view:books`       |   ✅    |   ✅   |  ✅   |
| `view:session`     |   ✅    |   ✅   |  ✅   |
| `read:published`   |   ✅    |   ✅   |  ✅   |
| `search:books`     |   ✅    |   ✅   |  ✅   |
| `follow:author`    | 🔐 Lazy |   ✅   |  ✅   |
| `rate:book`        | 🔐 Lazy |   ✅   |  ✅   |
| `favorite:book`    | 🔐 Lazy |   ✅   |  ✅   |
| `library:personal` |   ❌    |   ✅   |  ✅   |
| `download:book`    |   ❌    |   ✅   |  ✅   |
| `create:book`      |   ❌    |   ❌   |  ✅   |
| `edit:book`        |   ❌    |   ❌   |  ✅   |

---

## 8. Riscos e Mitigações

| Risco                                     | Prob. | Impacto | Mitigação                                           |
| ----------------------------------------- | ----- | ------- | --------------------------------------------------- |
| **Race condition sync + ação**            | Média | Alto    | Bloquear UI durante sync (`isSyncing`)              |
| **Sessão perdida (limpeza localStorage)** | Alta  | Baixo   | Toast explicativo, CTA para re-explorar             |
| **Cache corrompido**                      | Baixa | Médio   | `try/catch` no parse → limpa cache → busca Supabase |
| **Duplicidade no merge**                  | Baixa | Alto    | RPC já usa `NOT EXISTS`                             |
| **Hydration mismatch SSR**                | Alta  | Baixo   | `dynamic(..., { ssr: false })`                      |
| **Performance com muitos itens (>50)**    | Baixa | Médio   | Paginação + lazy loading de imagens                 |
| **BroadcastChannel não suportado**        | Baixa | Baixo   | Fallback para `focus` event listener                |
| **Erro no RPC de sync**                   | Média | Médio   | `syncPendingActions` como fallback + toast de retry |

---

## 9. Critérios de Sucesso

### Funcionais

- [ ] Anônimo acessa `/my-session` sem redirect
- [ ] Anônimo vê livros favoritados (com capa, título, autor)
- [ ] Anônimo vê autores seguidos (com avatar, nome, bio, book count)
- [ ] Dados persistem após refresh da página
- [ ] Dados persistem após fechar e reabrir navegador
- [ ] Sincronização automática no login sem perda de dados
- [ ] Sem duplicação de dados após sync
- [ ] Página funciona offline (cache localStorage)

### Técnicos

- [ ] Zero novas dependências externas
- [ ] Nenhuma modificação em features existentes (apenas reuso)
- [ ] Tipo `view:session` adicionado à `permissions.ts`
- [ ] Rota `/my-session` adicionada ao `proxy.ts`
- [ ] Build passa sem erros (`bun run build`)
- [ ] Lint sem warnings (`bun run lint`)
- [ ] Testes unitários > 80% cobertura no novo feature
- [ ] Testes E2E para fluxos principais

### UX

- [ ] Skeleton visível durante carregamento
- [ ] Estado vazio com ilustração e CTA
- [ ] Toast de confirmação ao favoritar/seguir
- [ ] Banner de sync visível após login
- [ ] Animações suaves (framer-motion)
- [ ] Responsivo (mobile + desktop)

---

## 10. Fluxos Completos

### Fluxo: Anônimo → Favoritar → Ver em /my-session

```
1. Usuário acessa /explore
2. Vê livro "Dom Casmurro"
3. Clica coração (favoritar)
   → useFavorites().addFavorite(book)
   → getAnonymousSessionId() → "anonymous-xyz"
   → addToFavorites("book-123", ..., "anonymous-xyz")
   → Supabase: INSERT user_favorites (session_id)
   → Zustand: favoritedIds.add("book-123")
   → Toast: "Dom Casmurro favoritado! Faça login..."
4. Usuário clica "Minha Sessão" no header
5. Navega para /my-session
6. SessionLibraryWidget monta
   → dynamic import com ssr:false
   → useSessionLibrary hook inicializa
   → useFavorites carrega via getUserFavorites("anonymous-xyz")
   → useAuthorFollowStore carrega via getFollowedAuthorsByUser()
   → Exibe hero + tabs + grid de favoritos
7. "Dom Casmurro" aparece no grid
8. Usuário recarrega a página
9. Dados no Supabase → mesma session_id → mesma lista
```

### Fluxo: Anônimo → Seguir → Login → Dados Migrados

```
1. Usuário anônimo segue 2 autores
2. Favorita 3 livros
3. Clica "Fazer login" no /my-session
4. Faz login com email+senha
5. onAuthStateChange dispara
6. useSessionSync detecta transição (null → user)
7. Chama migrateSessionDataAction("anonymous-xyz")
   → RPC: migrate_session_follows → 2 migrated
   → RPC: migrate_session_favorites → 3 migrated
   → RPC: migrate_session_ratings → 0 migrated
8. Chama syncPendingActions(userId) → 0 pendentes
9. SessionSyncBanner aparece:
   "✅ 5 dados sincronizados! Seus favoritos estão na sua conta."
10. useFavorites recarrega (agora por user_id)
11. useAuthorFollowStore recarrega (agora por user_id)
12. Grid atualiza com dados migrados
13. Toast: "Bem-vindo! Seus dados foram sincronizados."
14. Usuário pode acessar /dashboard/favorites com mesmos dados
```

### Fluxo: Erro de Sync + Retry

```
1. Anônimo favorita 5 livros (2 salvos no Supabase, 3 em pending actions)
2. Faz login
3. RPC migrate_session_favorites migra 2 (que estavam no Supabase)
4. syncPendingActions tenta os 3 pending actions
5. 2 succeedem, 1 falha (ex: rede)
6. Toast: "4 de 5 dados sincronizados. 1 ação pendente."
7. Botão "Tentar novamente" no SessionSyncBanner
8. Usuário clica → retenta a ação pendente
9. Se succeede → toast de sucesso, banner some
10. Se falha novamente → mantém pending action para próxima tentativa
```

---

## Checklist de Implementação

### Sprint 1 — Fundação

- [ ] Types criados
- [ ] Session sync store
- [ ] Server actions (favorites, authors, clear)
- [ ] Session cache lib
- [ ] Migration SQL (índices)

### Sprint 2 — UI + Rota

- [ ] Rota /my-session + loading
- [ ] useSessionLibrary hook
- [ ] SessionHero, SessionTabs UI
- [ ] FavoriteBookCard, FollowedAuthorCard UI
- [ ] Empty states
- [ ] SessionLibraryWidget container
- [ ] SessionFavoritesList, SessionAuthorsList widgets
- [ ] permissions.ts (view:session)
- [ ] proxy.ts (/my-session)
- [ ] landing-header (nav item)

### Sprint 3 — Sincronização + Testes

- [ ] useSessionSync hook
- [ ] SessionSyncBanner widget
- [ ] Integração com login
- [ ] BroadcastChannel multi-tab
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Edge cases tratados
- [ ] Build + Lint passando
