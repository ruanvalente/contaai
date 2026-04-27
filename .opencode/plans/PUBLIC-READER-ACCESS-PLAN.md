# Plano de Evolução: Acesso Leitor Anônimo

**Versão:** 1.0  
**Data:** 27/04/2026  
**Status:** Aprovado  
**Fases:** 5  

---

## Contexto

### Situação Atual

A aplicação Conta.AI atualmente exige login para todas as interações, incluindo leitura de livros. Isso cria uma barreira para leitores que apenas desejam consumir conteúdo.

### Problema Identificado

Leitores que querem apenas:
- Visualizar livros na landing page
- Ler livros
- Explorar autores
- Avaliar obras

São forçados a criar conta, resultando em perda de usuários.

### Decisões Arquiteturais

| Decisão | Escolha |
|---------|---------|
| **Autenticação para ações sociais** | Login lazy (solicita login apenas no momento da interação) |
| **Fontes de dados na landing page** | Unificada (books + user_books publicados) |
| **Persistência para anônimos** | localStorage (ações pendentes, histórico de leitura) |

---

## Fase 1: MVP - Acesso Público

**Duração estimada:** 2 semanas  
**Prioridade:** CRÍTICA  

### 1.1 Landing Page com Livros Reais

#### Backend
- [ ] Criar `getPublicBooksAction` que unifica `books` e `user_books` (status='published')
- [ ] Utilizar/suprimir view `unified_books` existente
- [ ] Adicionar paginação básica (20 livros por página)

#### Frontend
- [ ] Substituir dados hardcoded do carousel por chamada real à API
- [ ] Criar componente `PublicBookGrid` para landing page
- [ ] Implementar lazy loading de imagens

### 1.2 Página Explore (Descoberta de Livros) ✅ IMPLEMENTADO

**Objetivo:** Permitir que leitores anônimos naveguem por todos os livros publicados com filtros, busca e paginação.

**Nota:** Reaproveita a feature `public-books` já existente (`src/features/public-books/`), que possui:
- `getPublicBooksAction` com filtros (categoria, busca, paginação)
- `PublicBooksWidget` com search + category filter
- `PublicBookGrid` com skeletons e empty state
- `usePublicBooks` hook

#### Frontend
- [x] Criar rota `/explore` (página pública, sem proteção)
- [x] Criar `src/app/explore/page.tsx`:
  - Usa `PublicBooksWidget` com `showFilters` e `showSearch`
  - Grid responsivo de livros
  - Paginação (suportada pelo hook `usePublicBooks`)
- [x] Adicionar link "Explorar" no header da landing page (`src/features/discovery/widgets/landing-header.widget.tsx`)
- [ ] (Opcional) Sincronizar filtros com URL search params para links compartilháveis

#### UX (já existente na feature)
- ✅ Empty state amigável ("Nenhum livro encontrado")
- ✅ Skeleton loading durante busca
- ✅ Filtro por categoria via `CategoryFilter`

#### Arquivos criados/alterados:
| Arquivo | Ação |
|---------|--------|
| `src/app/explore/page.tsx` | **Criado** - Página pública usando `BookCard` com mesmo layout da seção "Obras em Destaque" |
| `src/features/discovery/widgets/landing-header.widget.tsx` | **Alterado** - Adicionado link "Explorar" no menu desktop e mobile |
| `src/features/discovery/widgets/books-showcase.widget.tsx` | **Alterado** - Adicionado botão "Ver todos os livros" linkando para `/explore` |
| `src/proxy.ts` | **Alterado** - `/explore` adicionado às rotas públicas do middleware |

#### Layout da Página Explore (alinhado com "Obras em Destaque"):
- Grid responsivo: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- `BookCard` com `isFeatured` para os 3 primeiros livros
- Filtro de categorias com links diretos (`/explore?category=...`)
- Paginação simples (Anterior / Próxima)
- Motion animations (`framer-motion`) consistentes com a landing page
- Fundo `bg-primary-200` igual à seção "Obras em Destaque"

### 1.3 Leitura Pública

#### Backend
- [ ] Ajustar RLS da tabela `user_books`:
  ```sql
  CREATE POLICY "Anyone can view published books"
  ON user_books FOR SELECT
  USING (status = 'published');
  ```
- [ ] Ajustar RLS de `book_reading_progress` para leitura sem escrita

#### Frontend
- [ ] Remover proteção de rota em `/book/[id]/*` (exceto `/book/[id]/edit`)
- [ ] Criar fallback `useAuthStore` em modo "anonymous reader"
- [ ] Ocultar botões de edição para anônimos

### 1.4 Middleware Atualizado

#### Arquivo: `/src/proxy.ts`
```typescript
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/landingpage',
  '/explore',         // <- ADICIONAR (descobrir livros)
  '/book/',           // <- ADICIONAR (leitura pública)
  '/book-dashboard/', // <- LIMITADO (edit requires auth)
  '/api/',
  // ... existentes
]
```

### Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| **Reaproveitado:** Action pública | `src/features/public-books/actions/public-books.actions.ts` |
| **Reaproveitado:** Widget de busca | `src/features/public-books/widgets/public-search.widget.tsx` |
| **Reaproveitado:** Filtro categoria | `src/features/public-books/ui/category-filter.ui.tsx` |
| **Reaproveitado:** Grid de livros | `src/features/public-books/ui/public-book-grid.ui.tsx` |
| **Reaproveitado:** Hook público | `src/features/public-books/hooks/use-public-books.ts` |
| **Novo:** Página Explore | `src/features/public-books/pages/explore.page.tsx` |
| **Novo:** Middleware ajustado | `src/proxy.ts` |
| **Novo:** RLS atualizado | `supabase/migrations/0XX_update_rls.sql` |

---

## Fase 2: Autenticação Lazy

**Duração estimada:** 1-2 semanas  
**Prioridade:** ALTA  

### 2.1 Hook de Auth Lazy

#### Arquivo: `src/shared/hooks/use-auth-redirect.ts`
```typescript
'use client'
export function useAuthRedirect() {
  const store = useAuthStore()
  
  const requireAuth = (callback: () => Promise<void>, fallback?: string) => {
    if (store.user) {
      return callback()
    }
    // Armazenar intent + redirecionar
    redirectToLogin({ callback, fallback })
  }
  
  return { requireAuth }
}
```

### 2.2 Ações com Auth Lazy

#### Server Actions (protegidas)
| Action | Arquivo | Comportamento |
|--------|---------|---------------|
| `followAuthor` | `src/features/auth/actions/follow-author.action.ts` | `requireAuth()` |
| `rateBook` | `src/features/discovery/actions/rate-book.action.ts` | `requireAuth()` |
| `addFavorite` | `src/features/discovery/actions/favorites.actions.ts` | `requireAuth()` |

#### Fluxo
```
Usuário clica "Seguir Autor"
├── Autenticado? → Executa ação → Toast "Seguindo!"
└── Não autenticado? 
    ├── Salva intent em localStorage
    ├── Redireciona para /login?redirect=/book/123&intent=follow
    └── Após login → Executa ação savedIntent
```

### 2.3 Componentes com Lazy Auth

| Componente | Arquivo | Estado |
|------------|---------|--------|
| `FollowButton` | `src/features/auth/ui/follow-button.ui.tsx` | ✅ |
| `RatingInput` | `src/features/discovery/ui/rating-input.ui.tsx` | ✅ |
| `FavoriteButton` | `src/shared/ui/favorite-button.ui.tsx` | ✅ |

### Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| Hook de redirect | `src/shared/hooks/use-auth-redirect.ts` |
| Action protected | `src/features/auth/actions/require-auth.action.ts` |
| Componentes atualizados | `src/features/*/ui/*.ui.tsx` (3 arquivos) |

---

## Fase 3: Diferenciação Leitor × Autor

**Duração estimada:** 1-2 semanas  
**Prioridade:** MÉDIA  

### 3.1 Sistema de Perfis

#### Banco de Dados
```sql
-- Migration: 0XX_add_user_role.sql
ALTER TABLE profiles 
ADD COLUMN role TEXT DEFAULT 'reader' 
CHECK (role IN ('reader', 'author'));

-- Atualizar automaticamente usuários com livros publicados
UPDATE profiles 
SET role = 'author' 
WHERE id IN (SELECT DISTINCT user_id FROM user_books WHERE status = 'published');
```

#### Backend
- [ ] Criar `getUserRole` action
- [ ] Detectar autor automaticamente: usuário com livros publicados → role='author'
- [ ] Admin manual: ability para promuevar reader → author

### 3.2 Landing Page Adaptativa

#### Frontend: `src/features/discovery/pages/landing.page.tsx`
```typescript
const { user, role } = useAuthStore()

return (
  <>
    {!user && <PublicBooksList />}
    {user && role === 'reader' && <ReaderLanding />}
    {user && role === 'author' && <AuthorDashboard />}
  </>
)
```

### 3.3 Menu/Navbar por Perfil

#### Arquivo: `src/shared/widgets/navbar.widget.tsx`

| Estado | Items |
|--------|-------|
| **Anônimo** | Início, Explorar, Login, Cadastrar |
| **Leitor** | Início, Biblioteca, Favoritos, Downloads, Perfil |
| **Autor** | + Dashboard, Criar Livro |

### Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| Migration role | `supabase/migrations/0XX_add_user_role.sql` |
| Action getRole | `src/features/auth/actions/get-user-role.action.ts` |
| Navbar dinâmica | `src/shared/widgets/navbar.widget.tsx` |

---

## Fase 4: Limitações para Anônimos

**Duração estimada:** 1 semana  
**Prioridade:** MÉDIA  

### 4.1 Matriz de Permissões

| Ação | Anônimo | Leitor | Autor |
|------|:-------:|:------:|:-----:|
| Ver livros | ✅ | ✅ | ✅ |
| Ler livros publicados | ✅ | ✅ | ✅ |
| Buscar livros | ✅ | ✅ | ✅ |
| Seguir autor | 🔐 Lazy | ✅ | ✅ |
| Avaliar livro | 🔐 Lazy | ✅ | ✅ |
| Favoritar | 🔐 Lazy | ✅ | ✅ |
| Biblioteca pessoal | ❌ | ✅ | ✅ |
| Downloads | ❌ | ✅ | ✅ |
| Criar livro | ❌ | ❌ | ✅ |
| Editar livro | ❌ | ❌ | ✅ |

### 4.2 Persistência Local para Anônimos

#### Arquivo: `src/shared/lib/anonymous-persistence.ts`
```typescript
interface PendingAction {
  type: 'follow' | 'rate' | 'favorite'
  payload: Record<string, unknown>
  timestamp: number
}

export function savePendingAction(action: PendingAction) {
  const pending = getPendingActions()
  pending.push(action)
  localStorage.setItem('pending_actions', JSON.stringify(pending))
}

export async function syncPendingActions(userId: string) {
  const pending = getPendingActions()
  for (const action of pending) {
    await executeAction(action, userId)
  }
  clearPendingActions()
}
```

### 4.3 Feedback Visual

#### Tooltips/Badges
- Ícones com badge "Faça login" em ações lazy
- Toast: "Salvo na sua conta! Faça login para acessar em outros dispositivos."

### Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| Biblioteca persistência | `src/shared/lib/anonymous-persistence.ts` |
| Componentes com limitação | UI components atualizados |
| Toasts/Badges | `src/shared/ui/toast-notification.ui.tsx` |

---

## Fase 5: Otimizações

**Duração estimada:** 1-2 semanas  
**Prioridade:** BAIXA  

### 5.1 Performance

- [ ] Streaming na listagem de livros (`loading.tsx` com Suspense)
- [ ] Caching com `React.cache()` para queries frequentes
- [ ] Lazy load de imagens de capa (`next/image` com placeholder)
- [ ] Virtualização de listas longas (>100 livros)

### 5.2 SEO

- [ ] Metadata dinâmica por livro (`generateMetadata`)
- [ ] Open Graph tags para compartilhamento
- [ ] Sitemap.xml com livros públicos
- [ ] Schema.org para livros (Structured Data)

### 5.3 Analytics

Eventos a trackear:
| Evento | Descrição |
|--------|----------|
| `page_view_anon` | Leituras por anônimos |
| `reading_start_anon` | Início de leitura (anônimo) |
| `auth_redirect_triggered` | Usuário redirecionado para login |
| `lazy_auth_converted` | Conversão após login lazy |
| `reader_to_author` | Anônimo → Leitor → Autor |

### 5.4 Monitoramento

```typescript
// Dashboard sugeridos
- Taxa anônimos vs autenticados
- Conversão lazy auth (%)
- Tempo médio até primeira leitura
- Livros mais lidos (todos)
```

### Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| Suspense boundaries | Pages atualizadas |
| OG images | `app/book/[id]/opengraph-image.tsx` |
| Sitemap | `app/sitemap.ts` |
| Analytics events | `src/lib/analytics.ts` |

---

## Melhorias Futuras

### Curto Prazo (Pós-Fase 4)

#### 1. Leitura Offline (Service Worker)
- **Objetivo:** Permitir que usuários leiam livros sem conexão
- **Benefício:** Experiência mobile aprimorada, leitura em qualquer lugar
- **Arquitetura:**
  ```typescript
  // src/sw.ts (Service Worker)
  // - Intercepta requests de livros
  // - Armazena conteúdo em Cache API
  // - Sincroniza progresso quando online
  ```
- **Arquivos:** `public/sw.js`, `src/lib/offline-manager.ts`
- **Backend:** Endpoint para download em lote (capítulos por capítulo)

#### 2. Social Login (OAuth)
- **Provedores:** Google, Apple (maior adoção mobile)
- **Impacto:**
  - Reduz atrito de cadastro em ~70%
  - Melhora conversão de visitantes para usuários
- **Implementação:** `@supabase/auth-helpers` com provedores OAuth
- **Arquivos:**
  - `src/features/auth/actions/social-auth.actions.ts`
  - `src/features/auth/ui/social-buttons.ui.tsx`

#### 3. Reading History Local
- **Funcionalidade:**
  - Salvar posição de leitura no localStorage
  - "Continue de onde parou" para usuários anônimos
  - Prompt estratégico: "Faça login para sincronizar leitura entre dispositivos"
- **UX Flow:**
  ```
  Usuário lê livro anônimo → Posição salva localStorage
  → Ao retornar: "Continue de onde parou?"
  → Ao fazer login: Sync automático
  ```
- **Arquivos:** `src/shared/lib/reading-history.ts`

### Médio Prazo (Pós-Fase 5)

#### 4. Gamificação Anônima
- **Métricas trackeáveis:**
  - Livros lidos esse mês
  - Sequência de leitura (streak)
  - Tempo total de leitura
  - Livros avaliados
- **UX:** "Você leu 5 livros este mês! Crie uma conta para desbloquear badges"
- **Prompt de conversão:** Mostrar achievements parciais como incentive
- **Arquivos:**
  - `src/features/gamification/achievements.ts`
  - `src/features/gamification/reader-stats.widget.tsx`

#### 5. Trail Reading (Freemium)
- **Modelo:**
  - Prime 3 capítulos gratuitos por livro
  - Paywall para resto do conteúdo
  - OU: livros específicos com preview gratuito
- **Backend:**
  ```sql
  ALTER TABLE user_books 
  ADD COLUMN has_preview BOOLEAN DEFAULT false,
  ADD COLUMN preview_chapters INTEGER DEFAULT 3;
  ```
- **Frontend:** Componente `PreviewGate` que exibe paywall após capítulo 3
- **Benefício:** Permite avaliar qualidade antes de comprometer tempo

#### 6. Sistema de Recomendação
- **Para anônimos:** Baseado em popularidade + categoria
- **Para logados:** Baseado em histórico de leitura + autores seguidos
- **Algoritmo:** Collaborative filtering simplificado
- **Arquivos:** `src/features/recommendations/`:
  - `get-recommendations.action.ts`
  - `recommendation-carousel.widget.tsx`

### Longo Prazo

#### 7. Newsletter Anônima
- **Cadastro lightweight:** Email apenas (sem senha)
- **Conteúdo:** Novos livros, notificações de autores seguidos
- **Benefício:** Capture leads sem atrito
- **Tabela:** `newsletter_subscribers`
- **Double opt-in:** Email de confirmação

#### 8. Comentários Públicos
- **Permissão anônima:** Leitura de comentários
- **Permissão logados:** Postar comentários diretamente
- **Moderação:** Aprovação prévia para novos usuários
- **Tabela:** `book_comments`:
  ```sql
  CREATE TABLE book_comments (
    id UUID PRIMARY KEY,
    book_id UUID REFERENCES user_books(id),
    user_id UUID REFERENCES auth.users(), -- nullable para anônimos
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ
  );
  ```

#### 9. Sistema de Coleções
- **Coleções públicas:** "Top 10 de Abril", "Recomendados pela comunidade"
- **Coleções privadas:** Criadas por usuários logados
- **Compartilháveis:** URL pública para cada coleção
- **Tabelas:**
  - `collections` (id, name, is_public, user_id, created_at)
  - `collection_books` (collection_id, book_id, position)

#### 10. Progresso Social
- **Comparação:** "Você está no top 20% dos leitores deste livro"
- **Leaderboards:** Por categoria, por tempo de leitura
- **Gamificação avançada:** Badges, níveis, recompensas

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Usuários consumindo sem criar conta | Alta | Baixo | Aceite (feature design) |
| Abuso de avaliações anônimas | Média | Alto | Rate limiting + captcha |
| Degradação de performance | Baixa | Médio | Caching agressivo |
| Complexidade de código | Média | Médio | Hooks compartilhados |

---

## Dependências Entre Fases

```
Fase 1 (MVP)
  ├── Requer: RLS updates
  └── Desbloqueia: Fases 2, 3

Fase 2 (Lazy Auth)
  ├── Requer: Fase 1
  └── Desbloqueia: Fase 4 (parcialmente)

Fase 3 (Perfis)
  ├── Requer: Fase 1
  └── Pode ser feito em paralelo com Fase 2

Fase 4 (Limitações)
  └── Requer: Fases 2 + 3

Fase 5 (Otimizações)
  └── Requer: Fases 1-4 completas
```

---

## Checklist de Implementação

### Fase 1: MVP
- [x] Migration RLS atualizada
- [x] Action `getPublicBooksAction` criada
- [x] Landing page com dados reais (feature criada)
- [x] Leitura pública funcionando
- [x] Página `/explore` criada (`src/app/explore/page.tsx`)
- [x] Link "Explorar" adicionado no header (`landing-header.widget.tsx`)
- [x] Middleware ajustado (`/explore` e `/book/` adicionados)

### Fase 2: Lazy Auth
- [ ] Hook `useAuthRedirect` implementado
- [ ] `FollowButton` com lazy auth
- [ ] `RatingInput` com lazy auth
- [ ] `FavoriteButton` com lazy auth
- [ ] Redirect com callback funcionando

### Fase 3: Diferenciação
- [ ] Migration `role` executada
- [ ] Action `getUserRole` implementada
- [ ] Navbar adaptativa
- [ ] Landing page dinâmica

### Fase 4: Limitações
- [ ] Matriz de permissões aplicada
- [ ] Biblioteca de persistência anônima
- [ ] Toasts/badges implementados
- [ ] Sync no login funcionando

### Fase 5: Otimizações
- [ ] Performance verificada
- [ ] SEO implementado
- [ ] Analytics configurado
- [ ] Monitoramento ativo

### Melhorias Futuras
- [ ] Service Worker para offline
- [ ] Social login (Google/Apple)
- [ ] Reading history local
- [ ] Gamificação anônima
- [ ] Trail reading (freemium)
- [ ] Sistema de recomendação
- [ ] Newsletter anônima
- [ ] Comentários públicos
- [ ] Sistema de coleções
- [ ] Progresso social/leaderboards