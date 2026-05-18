# Plano de Evolução: Acesso Leitor Anônimo

**Versão:** 1.1  
**Data:** 27/04/2026  
**Status:** Fase 5 Em Progresso  
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

| Decisão                             | Escolha                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| **Autenticação para ações sociais** | Login lazy (solicita login apenas no momento da interação) |
| **Fontes de dados na landing page** | Unificada (books + user_books publicados)                  |
| **Persistência para anônimos**      | localStorage (ações pendentes, histórico de leitura)       |

---

## Fase 1: MVP - Acesso Público

**Duração estimada:** 2 semanas  
**Prioridade:** CRÍTICA

### 1.1 Landing Page com Livros Reais

#### Backend

- [x] Criar `getPublicBooksAction` que unifica `books` e `user_books` (status='published')
- [x] Utilizar/suprimir view `unified_books` existente
- [x] Adicionar paginação básica (20 livros por página)

#### Frontend

- [x] Substituir dados hardcoded do carousel por chamada real à API
- [x] Criar componente `PublicBookGrid` para landing page
- [x] Implementar lazy loading de imagens

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

| Arquivo                                                    | Ação                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app/explore/page.tsx`                                 | **Criado** - Página pública usando `BookCard` com mesmo layout da seção "Obras em Destaque" |
| `src/features/discovery/widgets/landing-header.widget.tsx` | **Alterado** - Adicionado link "Explorar" no menu desktop e mobile                          |
| `src/features/discovery/widgets/books-showcase.widget.tsx` | **Alterado** - Adicionado botão "Ver todos os livros" linkando para `/explore`              |
| `src/proxy.ts`                                             | **Alterado** - `/explore` adicionado às rotas públicas do middleware                        |

#### Layout da Página Explore (alinhado com "Obras em Destaque"):

- Grid responsivo: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- `BookCard` com `isFeatured` para os 3 primeiros livros
- Filtro de categorias com links diretos (`/explore?category=...`)
- Paginação simples (Anterior / Próxima)
- Motion animations (`framer-motion`) consistentes com a landing page
- Fundo `bg-primary-200` igual à seção "Obras em Destaque"

### 1.3 Leitura Pública

#### Backend

- [x] Ajustar RLS da tabela `user_books`:
  ```sql
  CREATE POLICY "Anyone can view published books"
  ON user_books FOR SELECT
  USING (status = 'published');
  ```
- [x] Ajustar RLS de `book_reading_progress` para leitura sem escrita

#### Frontend

- [x] Remover proteção de rota em `/book/[id]/*` (exceto `/book/[id]/edit`)
- [x] Criar fallback `useAuthStore` em modo "anonymous reader"
- [x] Ocultar botões de edição para anônimos

### 1.4 Middleware Atualizado

#### Arquivo: `/src/proxy.ts`

```typescript
const publicPaths = [
  "/",
  "/explore", // <- ADICIONADO (descobrir livros)
  "/landingpage",
  "/login",
  "/register",
  "/book/", // <- ADICIONADO (leitura pública)
  "/book-dashboard/", // <- LIMITADO (edit requires auth)
  "/api/",
  // ... existentes
];
```

### Entregáveis

| Entregável                          | Arquivo                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| **Reaproveitado:** Action pública   | `src/features/public-books/actions/public-books.actions.ts`  |
| **Reaproveitado:** Widget de busca  | `src/features/public-books/widgets/public-search.widget.tsx` |
| **Reaproveitado:** Filtro categoria | `src/features/public-books/ui/category-filter.ui.tsx`        |
| **Reaproveitado:** Grid de livros   | `src/features/public-books/ui/public-book-grid.ui.tsx`       |
| **Reaproveitado:** Hook público     | `src/features/public-books/hooks/use-public-books.ts`        |
| **Novo:** Página Explore            | `src/features/public-books/pages/explore.page.tsx`           |
| **Novo:** Middleware ajustado       | `src/proxy.ts`                                               |
| **Novo:** RLS atualizado            | `supabase/migrations/0XX_update_rls.sql`                     |

---

## Fase 2: Ações Anônimas Diretas (via Session ID)

**Duração estimada:** 1-2 semanas  
**Prioridade:** ALTA  
**Status:** ✅ IMPLEMENTADO (abordagem diferente do planejado)

### 2.1 Hook de Auth Redirect (Criado, mas não utilizado)

#### Arquivo: `src/shared/hooks/use-auth-redirect.ts`

- Implementado com `savePendingAction`, `getPendingAction`, `clearPendingAction`
- Expiração de 24h para pending actions
- **Nota:** Hook criado mas componentes da Fase 2 não o utilizam

### 2.2 Ações com Suporte a Anônimos (Session ID)

#### Server Actions (aceitam usuários anônimos via sessionId)

| Action           | Arquivo                                                       | Comportamento                                      |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `followAuthor`   | `src/features/author-follow/actions/author-follow.actions.ts` | Aceita `sessionId` opcional para anônimos          |
| `rateBook`       | `src/features/book-details/actions/rate-book.action.ts`       | Aceita `sessionId` opcional, salva `rated_by_type` |
| `addToFavorites` | `src/features/discovery/actions/favorites.actions.ts`         | Aceita `sessionId` opcional para anônimos          |
| `requireAuth`    | `src/features/auth/actions/require-auth.action.ts`            | Disponível para casos que exigem login obrigatório |

#### Fluxo Real Implementado

```
Usuário anônimo clica "Seguir Autor"
├── Gera sessionId via getAnonymousSessionId()
├── Chama followAuthor(authorName, sessionId)
├── Salva no banco com session_id (user_id = null)
└──反馈 imediato: "Seguindo!" (sem redirect)

Usuário logado clica "Seguir Autor"
├── Usa userId do auth
├── Salva no banco com user_id
└── Feedback imediato: "Seguindo!"
```

### 2.3 Componentes (Sem Lazy Auth)

| Componente               | Arquivo                                                           | Comportamento                                           |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------- |
| `AuthorFollowWidget`     | `src/features/author-follow/widgets/author-follow.widget.tsx`     | Chama `follow()` diretamente (usa store com sessionId)  |
| `RatingInput`            | `src/features/book-details/ui/rating-input.ui.tsx`                | Chama `onRate()` diretamente via `handleRate()`         |
| `FavoriteButton`         | `src/shared/ui/favorite-button.ui.tsx`                            | UI pura, recebe `onClick` do pai                        |
| `BookDetailsPanelWidget` | `src/features/book-details/widgets/book-details-panel.widget.tsx` | Gerencia rating/favoritos com `getAnonymousSessionId()` |

### 2.4 Store de Follow (Suporta Anônimos)

#### Arquivo: `src/features/author-follow/hooks/use-author-follow.ts`

- `follow(authorName)`: usa `getAnonymousSessionId()` se não autenticado
- `initialize()`: carrega follows por `user_id` OU `session_id`
- `isFollowing()`: verifica no array local `followedIds`

### 2.5 Login Form (Processa Pending Actions do Lazy Auth)

#### Arquivo: `src/features/auth/widgets/login-form.widget.tsx`

- Após login bem-sucedido, verifica `getPendingAction()`
- Executa ações pendentes: `follow`, `favorite`, `rate`
- Faz `clearPendingAction()` após execução
- **Nota:** Funcionalidade mantida para compatibilidade, mas fluxo principal mudou

### Entregáveis

| Entregável            | Arquivo                                                                   | Status                                   |
| --------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Hook de redirect      | `src/shared/hooks/use-auth-redirect.ts`                                   | ✅ Criado (não usado no fluxo principal) |
| Action require-auth   | `src/features/auth/actions/require-auth.action.ts`                        | ✅ Criado                                |
| Actions com sessionId | `author-follow.actions.ts`, `rate-book.action.ts`, `favorites.actions.ts` | ✅ Implementado                          |
| Store com anônimos    | `src/features/author-follow/hooks/use-author-follow.ts`                   | ✅ Implementado                          |
| Login com pending     | `src/features/auth/widgets/login-form.widget.tsx`                         | ✅ Implementado                          |
| Lib session anônima   | `src/shared/lib/anonymous-session.ts`                                     | ✅ Implementado                          |

---

## Fase 3: Diferenciação Leitor × Autor

**Duração estimada:** 1-2 semanas  
**Prioridade:** MÉDIA  
**Status:** ✅ IMPLEMENTADO (sem navbar adaptativa por perfil)

### 3.1 Sistema de Perfis

#### Banco de Dados

```sql
-- Migration: 030_add_user_role.sql
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'reader'
CHECK (role IN ('reader', 'author'));

-- Atualizar automaticamente usuários com livros publicados
UPDATE profiles
SET role = 'author'
WHERE id IN (SELECT DISTINCT user_id FROM user_books WHERE status = 'published');
```

**Triggers adicionados:**

- `auto_update_author_role`: atualiza role para `'author'` quando um livro é publicado
- `auto_downgrade_author_role`: rebaixa para `'reader'` quando o último livro publicado é removido

#### Backend

- [x] Criar `getUserRole` action
- [x] Detectar autor automaticamente: usuário com livros publicados → role='author'
- [ ] Admin manual: ability para promover reader → author (não implementado, postergado)

### 3.2 Landing Page Adaptativa

#### Frontend: `src/features/discovery/pages/landing.page.tsx`

```typescript
const { user, isInitialized, initialize } = useAuthStore();

useEffect(() => {
  initialize();
}, [initialize]);

useEffect(() => {
  if (isInitialized && user) {
    router.replace("/dashboard");
  }
}, [user, isInitialized, router]);
```

**Comportamento implementado:** Usuários logados são redirecionados para `/dashboard`; anônimos veem a landing page completa.

### 3.3 Auth Store com Role

#### Arquivo: `src/shared/storage/use-auth-store.ts`

- [x] `AuthUser.role?: UserRole` adicionado ao tipo
- [x] `initialize()` busca role do profile no banco
- [x] `onAuthStateChange` atualiza role em cada evento de auth
- [x] Fallback: detecta autor por published books se role não estiver explícito

### Entregáveis

| Entregável        | Arquivo                                             | Status                                   |
| ----------------- | --------------------------------------------------- | ---------------------------------------- |
| Migration role    | `supabase/migrations/030_add_user_role.sql`         | ✅ Criado                                |
| Action getRole    | `src/features/auth/actions/get-user-role.action.ts` | ✅ Criado                                |
| Auth store role   | `src/shared/storage/use-auth-store.ts`              | ✅ Modificado                            |
| Landing redirect  | `src/features/discovery/pages/landing.page.tsx`     | ✅ Modificado                            |
| Navbar adaptativa | `src/shared/widgets/navbar.widget.tsx`              | ❌ Não implementado (removido do escopo) |

---

## Fase 4: Limitações para Anônimos

**Duração estimada:** 1 semana  
**Prioridade:** MÉDIA

### 4.1 Matriz de Permissões

| Ação                  | Anônimo | Leitor | Autor |
| --------------------- | :-----: | :----: | :---: |
| Ver livros            |   ✅    |   ✅   |  ✅   |
| Ler livros publicados |   ✅    |   ✅   |  ✅   |
| Buscar livros         |   ✅    |   ✅   |  ✅   |
| Seguir autor          | 🔐 Lazy |   ✅   |  ✅   |
| Avaliar livro         | 🔐 Lazy |   ✅   |  ✅   |
| Favoritar             | 🔐 Lazy |   ✅   |  ✅   |
| Biblioteca pessoal    |   ❌    |   ✅   |  ✅   |
| Downloads             |   ❌    |   ✅   |  ✅   |
| Criar livro           |   ❌    |   ❌   |  ✅   |
| Editar livro          |   ❌    |   ❌   |  ✅   |

### 4.2 Persistência Local para Anônimos

#### Arquivo: `src/shared/lib/anonymous-persistence.ts`

```typescript
interface PendingAction {
  type: "follow" | "rate" | "favorite";
  payload: Record<string, unknown>;
  timestamp: number;
}

export function savePendingAction(action: PendingAction) {
  const pending = getPendingActions();
  pending.push(action);
  localStorage.setItem("pending_actions", JSON.stringify(pending));
}

export async function syncPendingActions(userId: string) {
  const pending = getPendingActions();
  for (const action of pending) {
    await executeAction(action, userId);
  }
  clearPendingActions();
}
```

### 4.3 Feedback Visual

#### Tooltips/Badges

- Ícones com badge "Faça login" em ações lazy
- Toast: "Salvo na sua conta! Faça login para acessar em outros dispositivos."

### Entregáveis

| Entregável                | Arquivo                                   |
| ------------------------- | ----------------------------------------- |
| Biblioteca persistência   | `src/shared/lib/anonymous-persistence.ts` |
| Componentes com limitação | UI components atualizados                 |
| Toasts/Badges             | `src/shared/ui/toast-notification.ui.tsx` |

---

## Fase 5: Otimizações

**Duração estimada:** 1-2 semanas  
**Prioridade:** BAIXA  
**Status:** 🚧 EM IMPLEMENTAÇÃO

### 5.1 Performance

- [x] Streaming na listagem de livros (`loading.tsx` com Suspense) - páginas existentes já possuem
- [x] Caching com `React.cache()` para queries frequentes - `getPublicBooksAction` já usa `cache()`
- [x] Lazy load de imagens de capa (`next/image` com placeholder) - `BookCover` já usa `next/image`
- [ ] Virtualização de listas longas (>100 livros) - Pendente

### 5.2 SEO

- [x] Metadata dinâmica por livro (`generateMetadata`) - `/book/[id]/page.tsx`
- [x] Open Graph tags para compartilhamento - `generateMetadata` com OG e Twitter cards
- [x] Open Graph image dinâmica - `/book/[id]/opengraph-image.tsx`
- [x] Sitemap.xml com livros públicos - `/app/sitemap.ts`
- [x] Schema.org para livros (Structured Data) - `BookSchemaLd` component

### 5.3 Analytics

Eventos implementados em `src/lib/analytics.ts`:

| Evento | Descrição | Status |
|--------|-----------|--------|
| `page_view_anon` | Página vista por anônimos | ✅ |
| `reading_start_anon` | Início de leitura (anônimo) | ✅ |
| `auth_redirect_triggered` | Usuário redirecionado para login | ✅ |
| `lazy_auth_converted` | Conversão após login lazy | ✅ |
| `reader_to_author` | Anônimo → Leitor → Autor | ✅ |

### 5.4 Monitoramento

- [ ] Dashboard de analytics (pendente integração com provedor)

### Entregáveis

| Entregável          | Arquivo                             | Status |
| ------------------- | ----------------------------------- | ------ |
| Suspense boundaries | Pages atualizadas                   | ✅     |
| OG images           | `app/book/[id]/opengraph-image.tsx` | ✅     |
| Sitemap             | `app/sitemap.ts`                    | ✅     |
| Analytics events    | `src/lib/analytics.ts`              | ✅     |
| Schema.org          | `BookSchemaLd` component             | ✅     |

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

| Risco                               | Probabilidade | Impacto | Mitigação               |
| ----------------------------------- | ------------- | ------- | ----------------------- |
| Usuários consumindo sem criar conta | Alta          | Baixo   | Aceite (feature design) |
| Abuso de avaliações anônimas        | Média         | Alto    | Rate limiting + captcha |
| Degradação de performance           | Baixa         | Médio   | Caching agressivo       |
| Complexidade de código              | Média         | Médio   | Hooks compartilhados    |

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

### Fase 2: Ações Anônimas Diretas (Session ID)

- [x] Hook `useAuthRedirect` criado (disponível, não usado no fluxo principal)
- [x] `author-follow.actions.ts` aceita `sessionId` para anônimos
- [x] `rate-book.action.ts` aceita `sessionId`, salva `rated_by_type`
- [x] `favorites.actions.ts` aceita `sessionId` para anônimos
- [x] `use-author-follow.ts` store gerencia follows anônimos
- [x] `book-details-panel.widget.tsx` usa `getAnonymousSessionId()`
- [x] Login form processa pending actions (compatibilidade)
- [ ] (Opcional) Migrar para Lazy Auth usando `useAuthRedirect` nas UIs

### Fase 3: Diferenciação

- [x] Migration `role` executada (com triggers de auto-update/downgrade)
- [x] Action `getUserRole` implementada (com fallback para published books)
- [x] Auth store com `AuthUser.role` populado no initialize e onAuthStateChange
- [x] Landing page redireciona usuários logados para `/dashboard`
- [ ] Navbar adaptativa (postergado — fora do escopo atual)

### Fase 4: Limitações

- [x] Matriz de permissões aplicada
- [x] Biblioteca de persistência anônima
- [x] Toasts/badges implementados
- [x] Sync no login funcionando

### Fase 5: Otimizações

- [x] Performance verificada (streaming, cache, lazy loading já existentes)
- [x] SEO implementado (metadata, OG, sitemap, schema.org)
- [x] Analytics configurado (src/lib/analytics.ts com 5 eventos)
- [ ] Monitoramento ativo (pendente integração com provedor)

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
