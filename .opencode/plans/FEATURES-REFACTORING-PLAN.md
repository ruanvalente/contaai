# Plano de Refatoração das Features do Projeto

> **Versão:** 1.1 (Atualizado)  
> **Data:** Abril 2026  
> **Objetivo:** Análise completa e plano de refatoração das features com foco em responsabilidades excessivas, acoplamento indevido e baixa legibilidade estrutural.

## Status da Migração (Concluído em 08/04/2026)

| Etapa | Status | Descrição |
|-------|--------|-----------|
| 1. Preparação | ✅ | Estrutura de diretórios criada |
| 2. Book-dashboard Data Layer | ✅ | application/queries/* criados |
| 3. Book-dashboard Commands | ✅ | application/commands/* criados (complementar) |
| 4. Book-dashboard Domain | ✅ | domain/types, domain/validators, infrastructure/supabase |
| 5. Discovery Application | ✅ | queries/search-books.query.ts, commands/favorite.command.ts |
| 6. Discovery Domain | ✅ | domain/types/search.types.ts |
| 7. Profile Application | ✅ | queries/get-profile.query.ts, commands/update-profile.command.ts |
| 8. Profile Domain | ✅ | domain/validators/profile.validator.ts |

---

## 1. Diagnóstico Geral da Estrutura Atual

### 1.1 Mapa das Features Existentes

| Feature | Arquivos | Linhas Totais | Estrutura Atual | Nível de Problema |
|---------|----------|--------------|-----------------|-------------------|
| `book-dashboard` | ~45 | ~3500 | `actions/`, `data/`, `hooks/`, `widgets/`, `pages/`, `editor/`, `types/`, `store/` | 🔴 Crítico |
| `discovery` | ~30 | ~1800 | `actions/` (ausente), `hooks/`, `widgets/`, `pages/`, `stores/`, `types/`, `ui/` | 🟡 Médio |
| `reading` | ~35 | ~1700 | `actions/`, `hooks/`, `ui/`, `utils/`, `types/`, `widgets/` | 🟢 Baixo |
| `profile` | ~20 | ~1500 | `actions/`, `hooks/`, `widgets/`, `pages/`, `types/`, `ui/`, `reading/` | 🟡 Médio |
| `auth` | ~3 | ~450 | `actions/`, `components/` | 🟢 Baixo |
| `library` | ~5 | ~200 | `hooks/` | 🟢 Baixo |

### 1.2 Estrutura de Arquivos por Feature

```
src/features/
├── auth/                    # Autenticação (ok)
│   ├── actions/
│   └── components/
├── book-dashboard/          # 🔴 PROBLEMA PRINCIPAL
│   ├── actions/            #⚠️ 509 linhas - god actions
│   ├── data/               #⚠️ 3 arquivos duplicados
│   ├── editor/             # Lógica de editor Lexical
│   ├── hooks/              #⚠️ Muitos hooks misturados
│   ├── pages/
│   ├── store/              # Stores Zustand
│   ├── types/
│   └── widgets/            #⚠️ Widgets com lógica de negócio
├── discovery/              # 🟡 Problema moderado
│   ├── hooks/
│   ├── pages/
│   ├── stores/            #⚠️ 4 stores fragmentados
│   ├── types/
│   ├── ui/
│   └── widgets/
├── library/                # 🟢 Pequeno
│   └── hooks/
├── profile/               # 🟡 Problema moderado
│   ├── actions/
│   ├── hooks/
│   ├── pages/            #⚠️ settings.page.tsx - 198 linhas
│   ├── reading/          # Feature aninhada
│   ├── types/
│   ├── ui/
│   └── widgets/
├── reading/               # 🟢 Melhor organizado
│   ├── actions/
│   ├── hooks/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── widgets/
└── (outros)
```

---

## 2. Identificação de Problemas Estruturais

### 2.1 Features Problemáticas - Análise Detalhada

#### 🔴 book-dashboard (CRÍTICO)

**Problemas identificados:**

| # | Problema | Arquivo(s) | Impacto |severidade |
|---|----------|-----------|---------|----------|
| 1 | **God Actions**: 509 linhas com múltiplas responsabilidades | `actions/user-books.actions.ts` | Rastreabilidade | CRÍTICO |
| 2 | **Data layer duplicada**: 3 arquivos para mesma função | `data/books.ts`, `data/server-books.ts`, `data/cached-books.ts` | Manutenção | CRÍTICO |
| 3 | **Hooks misturados**: 8+ hooks com responsabilidades diferentes | `hooks/use-book-editor.ts`, `hooks/use-editor-publish.ts`, `hooks/use-editor-toolbar.ts`, `hooks/use-books.ts`, etc. | Acoplamento | CRÍTICO |
| 4 | **Widgets com lógica de negócio**: lógica em widgets | `widgets/book-editor.widget.tsx`, `widgets/favorites-content.widget.tsx` | Separação | CRÍTICO |
| 5 | **Store fragmentation**: 2 stores com lógica extensa | `store/book-editor.store.ts` | Complexidade | MÉDIO |
| 6 | **Editor com plugins**: lógica Lexical misturada com UI | `editor/plugins/*.plugin.tsx` | Acoplamento | MÉDIO |

**Por que isso é um problema:**

1. `user-books.actions.ts` contém todas as operações: create, read, update, delete, publish, favorite, download - viola SRP
2. Data layer não should existir em frontend - deve ser apenas actions.cache() com revalidates
3.Hooks estão quebrando abstração - alguns fazem fetch, outros gestão de estado, outros UI
4. Widgets estão fazendo troppo - devem apenas renderizar, não gerenciar negócio

**Arquivos mais problemáticos:**

```bash
# Top arquivos por linhas (book-dashboard)
user-books.actions.ts          509  ⚠️ god actions
create-book-modal.widget.tsx  344  ⚠️ muito grande
data/server-books.ts        244  ⚠️ duplica responsabilidades
widgets/favorites-content   225  ⚠️ lógica misturada
hooks/use-editor-toolbar    219  ⚠️ UI em hook
data/books.ts             206  ⚠️ data layer incorreto
widgets/downloads-content 202  ⚠️ lógica de download
widgets/content-recovery   209  ⚠️ muito grande
widgets/book-editor       163  ⚠️  principal
hooks/use-book-editor    210  ⚠️ lógica excessiva
```

---

#### 🟡 discovery (MÉDIO)

**Problemas identificados:**

| # | Problema | Arquivo(s) | Impacto | Severidade |
|---|----------|-----------|---------|-----------|
| 1 | **Store fragmentation**: 4 stores para funcionalidades related | `stores/search.store.ts`, `stores/favorites.store.ts`, etc. | Acoplamento | MÉDIO |
| 2 | **Pages com lógica**: páginas com data fetching inline | `pages/landing.page.tsx` (154 linhas) | Mistura camadas | MÉDIO |
| 3 | **Hooks que são services**: alguns hooks são puros data fetchers | `hooks/use-search.ts`, `hooks/use-category-filter.ts` | Separação | BAIXO |
| 4 | **Inconsistência**: nem todas as features têm actions/ | discovery não tem actions/ | Organização | BAIXO |

**Por que isso é um problema:**

1. 4 stores indica que estado global está sendo usado onde estado local bastaria
2. discovery deveria ter server actions cacheadas, não hooks client para data fetching

---

#### 🟡 profile (MÉDIO)

**Problemas identificados:**

| # | Problema | Arquivo(s) | Impacto | Severidade |
|---|----------|-----------|---------|-----------|
| 1 | **Page muito grande**: settings.page.tsx com 198 linhas | `pages/settings.page.tsx` | Legibilidade | MÉDIO |
| 2 | **Actions misturadas**: actions de uploadmisturadas com profile actions | `actions/upload.actions.ts` (122 linhas) | SRP | MÉDIO |
| 3 | **Feature aninhada**: `reading/` dentro de profile parece feature independente | `profile/reading/` | Arquitetura | BAIXO |
| 4 | **profile-form.widget** grande: 147 linhas em hook use-profile-form | `hooks/use-profile-form.ts` | Acoplamento | BAIXO |

---

### 2.2 Classificação por Severidade

#### 🔴 CRÍTICO (resolve imediatamente)

| Feature | Problema | Caminho do Problema |
|---------|---------|-------------------|
| book-dashboard | God Actions (509 linhas) | `actions/user-books.actions.ts` |
| book-dashboard | Data layer duplicada | `data/books.ts`, `server-books.ts`, `cached-books.ts` |
| book-dashboard | Hooks com muita responsabilidade | `hooks/use-book-editor.ts`, hooks/use-editor-publish.ts |

#### 🟡 MÉDIO (resolver em paralelo)

| Feature | Problema | Caminho do Problema |
|---------|---------|-------------------|
| discovery | 4 stores fragmentados | `stores/*.store.ts` |
| discovery | Pages com lógica | `pages/landing.page.tsx` |
| profile | settings.page.tsx grande | `pages/settings.page.tsx` |
| profile | upload.actions.ts misturado | `actions/upload.actions.ts` |

#### 🟢 BAIXO (futuro)

| Feature | Problema | Caminho do Problema |
|---------|---------|-------------------|
| auth | Estrutura minima, ok | - |
| library | Pequeno, ok | - |
| reading | Melhor estrutura, referência | - |

---

## 3. Proposta de Nova Arquitetura

### 3.1 Padrão Estrutural Unificado

Cada feature deve seguir a seguinte estrutura baseada nas skills do projeto:

```
/features/[feature-name]/
  ├── domain/              # ⚠️ NOVO: Tipos e validações do domínio
  │   ├── types/         # Tipos TypeScript específicos do domínio
  │   └── validators/    # Funções de validação Zod/Joi
  ├── application/        # ⚠️ NOVO: Casos de uso
  │   ├── queries/      # Queries (leitura) - server actions cacheadas
  │   └── commands/    # Commands (escrita) - server actions
  ├── infrastructure/   # ⚠️ NOVO: Integrações externas
  │   ├── supabase/    # Queries Supabase otimizadas
  │   └── storage/    # Integrações storage
  ├── presentation/       # UI e componentes
  │   ├── ui/         # Componentes visuais puros (sem lógica)
  │   ├── widgets/    # Componentes com estado (useState/Zustand)
  │   └── pages/     # Composição de páginas
  ├── hooks/          # Hooks customizados (lógica de UI)
  ├── store/         # Zustand stores (apenas se necessário)
  ├── utils/        # Utilitários específicos
  └── index.ts      # Exports públicos
```

### 3.2 Estrutura Atual vs Nova Estrutura (book-dashboard)

**ANTES (atual):**

```
book-dashboard/
├── actions/
│   ├── user-books.actions.ts    ⚠️ 509 linhas - GOD
│   ├── books.actions.ts
│   ├── user-favorites.actions.ts
│   └── upload-book-cover.action.ts
├── data/
│   ├── books.ts              ⚠️ duplicado
│   ├── server-books.ts        ⚠️ duplicado
│   └── cached-books.ts     ⚠️ duplicado
├── hooks/
│   ├── use-book-editor.ts     ⚠️ muito grande
│   ├── use-editor-publish.ts
│   ├── use-editor-toolbar.ts
│   ├── use-books.ts
│   ├── use-categories.ts
│   └── ...
├── widgets/
│   ├── book-editor.widget.tsx
│   ├── favorites-content.widget.tsx
│   └── ...
└── editor/
    └── plugins/
        └── ...
```

**DEPOIS (proposto):**

```
book-dashboard/
├── domain/
│   ├── types/
│   │   ├── book.types.ts
│   │   └── user-book.types.ts
│   └── validators/
│       └── book.validator.ts
├── application/
│   ├── queries/
│   │   ├── get-books.ts           # nova - query cacheada
│   │   ├── get-book-by-id.ts
│   │   └── get-user-books.ts
│   └── commands/
│       ├── create-book.ts           #拆分 - cada ação uma arquivo
│       ├── update-book.ts
│       ├── delete-book.ts
│       ├── publish-book.ts
│       ├── save-book-content.ts
│       └── ...
├── infrastructure/
│   └── supabase/
│       └── book.queries.ts        # Queries Supabase otimizadas
├── presentation/
│   ├── ui/
│   │   └── ...
│   ├── widgets/
│   │   └── ...
│   └── pages/
│       └── book-dashboard.page.tsx
├── hooks/
│   └── use-book-editor.ts       # MANTIDO - mas menor
└── editor/
    └── plugins/
        └── ...
```

### 3.3 Resumo das Mudanças Estruturais

| Conceito Antigo | Conceito Novo | Ação |
|----------------|--------------|------|
| `data/*.ts` | `application/queries/*.ts` | Renomear + mover |
| `actions/user-books.actions.ts` | `application/commands/*.ts` | Quebrar em múltiplos arquivos |
| `hooks/use-X.ts` (puro fetch) | `application/queries/get-X.ts` | Migrar para server actions |
| `widgets/` com lógica | `presentation/widgets/` | Manter mas limpar |
| `stores/` dispersos | Consolidar em 1 store por feature | Mergiar quando possível |

---

## 4. Plano de Refatoração Step-by-Step

### ⚠️ Orientações Gerais

1. **Prefira segurança**: Sempre faça uma feature funcionar antes de mexer na próxima
2. **Mantenha compatibilidade**: Use re-exports temporários para não quebrar imports existentes
3. **Teste manualmente**: Após cada etapa, verifique se a feature continua funcionando
4. **Commits pequenos**: Divida em commits atômicos para facilitar rollback

---

### Etapa 1: Preparação (Pré-refatoração)

**Objetivo:** Criar nova estrutura sem quebrar nada

| # | Ação | Arquivo Criado | Dependências |
|---|------|----------------|-------------|
| 1.1 | Criar estrutura de diretórios | - | nenhuma |
| 1.2 | Criar arquivo de re-export para compatibilidade | `index.ts` em cada feature | nenhuma |
| 1.3 | Adicionar scripts de lint/typecheck ao workflow | CI | nenhuma |

**Commits sugeridos:**

```bash
git commit -m "refactor(features): setup new directory structure"
```

---

### Etapa 2: book-dashboard - Data Layer (CRÍTICO)

**Objetivo:** Remover data layer duplicada e migrar para server actions

| # | Ação | Before | After |
|----|------|--------|-------|
| 2.1 | Identificar queries duplicadas | `data/books.ts`, `data/server-books.ts`, `data/cached-books.ts` |
| 2.2 | Criar `application/queries/` | - |
| 2.3 | Migrar cada query para arquivo separado | 1 arquivo por query |
| 2.4 | Criar re-export em `data/` apontando para novo | - |
| 2.5 | Deletar `data/` | após verificação |

**Nova estrutura de queries:**

```
application/
├── queries/
│   ├── get-books.ts           # getBooks() - cacheada
│   ├── get-book-by-id.ts    # getBookById(id) - cacheada
│   ├── get-user-books.ts  # getUserBooks() - cacheada
│   ├── get-categories.ts
│   └── search-books.ts
└── commands/
    ├── create-book.ts
    ├── update-book.ts
    ├── delete-book.ts
    └── publish-book.ts
```

**Commits sugeridos:**

```bash
git commit -m "refactor(book-dashboard): split data layer into queries"
git commit -m "refactor(book-dashboard): remove legacy data/ directory"
```

---

### Etapa 3: book-dashboard - Actions (CRÍTICO)

**Objetivo:** Quebrar god actions em múltiplos arquivos menores

| # | Ação | Detalhe |
|----|------|--------|
| 3.1 | Analisar user-books.actions.ts | Mapear todas as functions |
| 3.2 | Separar por responsabilidade | 1 arquivo por domínio |
| 3.3 | Criar commands/*.ts | create, update, delete, publish, favorite, download |
| 3.4 | Criar re-export | Mantercompatibilidade |
| 3.5 | Deletar antigo | Após verificar |

**Divisão proposta:**

| Arquivo Original | Arquivos Novos |
|----------------|---------------|
| `user-books.actions.ts` (509 linhas) | `application/commands/` |
| | ├── create-book.ts |
| | ├── update-book.ts |
| | ├── delete-book.ts |
| | ├── publish-book.ts |
| | ├── add-favorite.ts |
| | ├── remove-favorite.ts |
| | ├── download-book.ts |
| | └── save-content.ts |

**Commits sugeridos:**

```bash
git commit -m "refactor(book-dashboard): split commands by responsibility"
git commit -m "refactor(book-dashboard): remove god actions file"
```

---

### Etapa 4: book-dashboard - Hooks (CRÍTICO)

**Objetivo:** Reduzir tanggungabilidades dos hooks

| # | Ação | Before | After |
|----|------|--------|-------|
| 4.1 | Categorizar hooks | Misturados | Separados por tipo |
| 4.2 | Manter hooks de UI | `use-book-editor.ts` | Manter, limpar |
| 4.3 | Migrar hooks de fetch | `use-books.ts` | Server actions |
| 4.4 | Migrar hooks de cache | `use-categories.ts` | Queries cacheadas |

**Divisão:**

| Hook | Tipo | Ação |
|------|------|------|
| `use-book-editor.ts` | UI State | Manter (reduzir linhas) |
| `use-books.ts` | Data Fetch | Migrar para query |
| `use-categories.ts` | Data Fetch | Migrar para query |
| `use-editor-publish.ts` | UI State | Limpar |
| `use-editor-toolbar.ts` | UI State | Limpar |
| `use-selected-book.ts` | UI State | Manter |

**Commits sugeridos:**

```bash
git commit -m "refactor(book-dashboard): migrate data hooks to server actions"
```

---

### Etapa 5: book-dashboard - Editor (MÉDIO)

**Objetivo:** Isolar lógica Lexical

| # | Ação |
|----|------|
| 5.1 | Manter editor/ como está (já isolado) |
| 5.2 | Garantir que plugins são puros |
| 5.3 | Revisar imports de plugins |

---

### Etapa 6: discovery - Stores (MÉDIO)

**Objetivo:** Consolidar stores duplicados

| # | Ação | Before | After |
|----|------|--------|-------|
| 6.1 | Mapear stores | 4 stores | Avaliar necessidade |
| 6.2 | Unificar stores relacionados | search + favorites | 1 store |
| 6.3 | Migrar para server actions | use-search.ts | queries |
| 6.4 | Deletar stores desnecessários | - | Limpar |

**Stores atuais:**

- `search.store.ts` - state de busca
- `favorites.store.ts` - favoritos
- `pagination-cache.store.ts` - cache de paginação
- `category-cache.store.ts` - cache de categorias

**Proposta:**

| Store | Ação |
|-------|------|
| `search.store.ts` | Migrar para `useSearch` hook + query |
| `favorites.store.ts` | Unificar em library store |
| `pagination-cache.store.ts` | Remover - usar SWR/React Query |
| `category-cache.store.ts` | Remover - usar cache de server action |

---

### Etapa 7: discovery - Pages (MÉDIO)

**Objetivo:** Remover lógica das pages

| # | Ação |
|----|------|
| 7.1 | Identificar lógica em pages |
| 7.2 | Extrair para hooks/server actions |
| 7.3 | Pages apenas compõem componentes |

---

### Etapa 8: profile - Pages (MÉDIO)

**Objetivo:** Reduzir tamanho de settings.page.tsx

| # | Ação | Before | After |
|----|------|--------|-------|
| 8.1 | Analisar settings.page.tsx | 198 linhas | Menos de 100 |
| 8.2 | Identificar lógica | dados, validação | Hooks |
| 8.3 | Extrair componentes | - | presentation/ui/ |
| 8.4 | Limpar actions |upload.actions.ts | Separar |

**Proposta para profile:**

```
profile/
├── domain/
│   └── types/
│       └── profile.types.ts
├── application/
│   ├── queries/
│   │   └── get-profile.ts
│   └── commands/
│       ├── update-profile.ts
│       └── upload-avatar.ts     # NOVO - separado
├── presentation/
│   ├── ui/
│   │   ├── profile-form.ui.tsx
│   │   └── avatar-upload.ui.tsx
│   ├── widgets/
│   │   └── settings.widget.tsx
│   └── pages/
│       └── settings.page.tsx   # Agora small
├── hooks/
│   └── use-profile-form.ts
└── store/
    └── (se necessário)
```

---

### Etapa 9: Limpeza Geral (BAIXO)

| # | Ação |
|----|------|
| 9.1 | Verificar imports quebrados |
| 9.2 | Rodar lint + typecheck |
| 9.3 | Testar manualmente cada feature |
| 9.4 | Deletar arquivos duplicados |
| 9.5 | Atualizar documentação |

---

### Etapa 10: Guidelines (FINAL)

**Objetivo:** Criar guia para evitar regressões

| # | Ação |
|----|------|
| 10.1 | Documentar nova estrutura em AGENTS.md |
| 10.2 | Criar checklist para novas features |
| 10.3 | Configurar lint rules |
| 10.4 | Criar husky/git hooks |

---

## 5. Exemplo Prático: book-dashboard

### 5.1 Estrutura Atual

```
src/features/book-dashboard/
├── actions/
│   └── user-books.actions.ts   # 509 linhas - PROBLEMA
├── data/
│   ├── books.ts                # 206 linhas - duplicado
│   ├── server-books.ts         # 244 linhas - duplicado
│   └── cached-books.ts         # 165 linhas - duplicado
├── hooks/
│   ├── use-book-editor.ts       # 210 linhas
│   └── ...
└── widgets/
    ├── book-editor.widget.tsx
    └── favorites-content.widget.tsx
```

### 5.2 Estrutura Proposta

```
src/features/book-dashboard/
├── domain/
│   ├── types/
│   │   ├── book.types.ts
│   │   └── user-book.types.ts
│   └── validators/
│       └── book.validator.ts    # NOVO
├── application/
│   ├── queries/
│   │   ├── get-books.ts          # Cacheable - antes data/books.ts + data/server-books.ts
│   │   ├── get-book-by-id.ts
│   │   └── get-user-books.ts
│   └── commands/                # Server Actions
│       ├── create-book.ts       #拆分 de user-books.actions.ts
│       ├── update-book.ts
│       ├── delete-book.ts
│       ├── publish-book.ts
│       ├── add-favorite.ts
│       └── save-content.ts
├── infrastructure/
│   └── supabase/
│       └── book.queries.ts     # Queries Supabase otimizadas
├── presentation/
│   ├── ui/
│   │   ├── book-card.ui.tsx
│   │   └── ...
│   ├── widgets/
│   │   ├── book-editor.widget.tsx   #Agora clean
│   │   └── favorites-content.widget.tsx
│   └── pages/
│       └── book-dashboard.page.tsx
├── hooks/
│   └── use-book-editor.ts    # Menos linhas
└── editor/
    └── plugins/
        └── ...
```

### 5.3 Exemplo de Código - Antes e Depois

**ANTES:** `actions/user-books.actions.ts` (509 linhas)

```typescript
// ⚠️ PROBLEMA: Tudo em um arquivo
'use server'

export async function createUserBook(input: CreateUserBookInput) {
  // lógica de create
}

export async function getUserBooks(userId: string) {
  // lógica de get
}

export async function getBookById(bookId: string) {
  // lógica de get by id
}

export async function updateBook(bookId: string, input: UpdateUserBookInput) {
  // lógica de update
}

export async function deleteBook(bookId: string) {
  // lógica de delete
}

export async function publishBook(bookId: string) {
  // lógica de publish
}

export async function unpublishBook(bookId: string) {
  // lógica de unpublish
}

export async function addFavorite(userId: string, bookId: string) {
  // lógica de favorite
}

export async function removeFavorite(userId: string, bookId: string) {
  // lógica de unfavorite
}

export async function downloadBook(bookId: string) {
  // lógica de download
}

// ... mais 20+ funções
```

**DEPOIS:** `application/commands/create-book.ts` (~50 linhas)

```typescript
// ✅ BOM: Uma responsabilidade por arquivo
'use server'

import { cache } from 'react'
import { getSupabaseServerClient } from '@/utils/supabase/server'
import { getCurrentUserId } from '@/utils/auth/get-current-user.server'
import { bookSchema } from '@/features/book-dashboard/domain/validators/book.validator'
import { revalidatePath } from 'next/cache'

export const createBook = cache(async (input: CreateUserBookInput) => {
  const userId = await getCurrentUserId()
  
  const validated = bookSchema.parse(input)
  
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('user_books')
    .insert({ ...validated, user_id: userId })
    .select()
    .single()
  
  if (error) {
    throw new Error('Failed to create book')
  }
  
  revalidatePath('/dashboard/library')
  
  return formatBook(data)
})
```

**ANTES:** `data/books.ts` + `data/server-books.ts` + `data/cached-books.ts` (~615 linhas total)

```typescript
// ⚠️ PROBLEMA: 3 arquivos para mesma função

// data/books.ts
export async function getBooks() {
  const supabase = await getSupabaseServerClient()
  return supabase.from('books').select('*')
}

// data/server-books.ts  
export async function getServerBooks() {
  const supabase = await getSupabaseServerClient()
  return supabase.from('user_books').select('*')
}

// data/cached-books.ts
export async function getCachedBooks() {
  // cache logic
}
```

**DEPOIS:** `application/queries/get-books.ts` (~30 linhas)

```typescript
// ✅ BOM: Uma query por arquivo, cacheável
'use server'

import { cache } from 'react'
import { getSupabaseServerClient } from '@/utils/supabase/server'

export const getBooks = cache(async (category?: string) => {
  const supabase = await getSupabaseServerClient()
  
  let query = supabase
    .from('user_books')
    .select('*, authors(*)')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching books:', error)
    return []
  }
  
  return data
})
```

---

## 6. Diretrizes para o Futuro

### 6.1 Checklist para Nova Feature

Ao criar uma nova feature, siga esta estrutura:

```
features/
└── new-feature/
    ├── domain/
    │   └── types/
    │       └── new-feature.types.ts
    ├── application/
    │   ├── queries/
    │   │   └── get-items.query.ts
    │   └── commands/
    │       └── create-item.command.ts
    ├── presentation/
    │   ├── ui/
    │   │   └── item.ui.tsx
    │   ├── widgets/
    │   │   └── item-list.widget.tsx
    │   └── pages/
    │       └── new-feature.page.tsx
    └── hooks/
        └── use-item-state.ts
```

### 6.2 Regras de Nomeação

| Tipo | Padrão | Exemplo |
|------|--------|--------|
| Server Action (query) | `get-*.ts` | `get-books.ts` |
| Server Action (command) | `*.command.ts` | `create-book.command.ts` |
| Query hook | `use-*-query.ts` | `use-books-query.ts` |
| UI hook | `use-*.ts` | `use-sidebar.ts` |
| UI component | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `form.widget.tsx` |
| Page | `*.page.tsx` | `dashboard.page.tsx` |

### 6.3 Quando Dividir uma Feature

Sinal de que uma feature precisa ser dividida:

| Sinal | Ação |
|-------|------|
| Arquivo > 300 linhas | Dividir em múltiplos arquivos |
| Hook faz fetch + estado | Separar fetch para query |
| 3+ stores relacionados | Unificar em 1 store |
| Feature aninhada (profile/reading) | Extrair para feature própria |
| Múltiplas responsabilidades em 1 arquivo | SRP - quebrar |

### 6.4 Anti-Patterns a Evitar

| Anti-Pattern | Problema | Solução |
|-------------|---------|--------|
| `data/*.ts` em features | Não existe data layer no frontend | Usar `application/queries/` |
| God Actions (> 300 linhas) | Viola SRP | Uma action por arquivo |
| Client hooks para fetch | Mistura concerns | Server actions cacheadas |
| Widget com lógica de negócio | Mistura camadas | Extrair para hook/useCase |
| Store para cada funcionalidade | Over-engineering | Zustand só se necessário |
| Pages com lógica inline | Violates separation | Extrair para hooks/queries |

### 6.5 Padrão de Import

```typescript
// ✅ CORRETO: Imports organizados por camada
// 1. Domain
import { Book } from '@/features/book-dashboard/domain/types/book.types'

// 2. Application (queries/commands)
import { getBooks } from '@/features/book-dashboard/application/queries/get-books'
import { createBook } from '@/features/book-dashboard/application/commands/create-book'

// 3. Presentation
import { BookCard } from '@/features/book-dashboard/presentation/ui/book-card.ui'

// 4. Hooks
import { useBookEditor } from '@/features/book-dashboard/hooks/use-book-editor'

// ❌ ERRADO: Imports bagunçados
import { Book, getBooks, useBookEditor } from '@/features/book-dashboard'
```

---

## 7. Riscos e Mitigações

### 7.1 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebrar imports existentes | Alta | Alto | Re-exports temporários + teste manual |
| Breaking changes em produção | Média | Alto | Feature flags / releases graduais |
| Tempo de refatoração | Alta | Médio | Alternar com feature development |
| Bugs introduzidos | Média | Alto | Teste manual após cada etapa |

### 7.2 Estratégia de Rollback

Para cada etapa:
1. Commits pequenos e atômicos
2. Testar manualmente antes de commitar
3. Ter branch separado para refatoração
4. Reverter apenas a etapa específica se necessário

---

## 8. Cronograma Sugerido

| Etapa | Esforço Estimado | dependências |
|------|-----------------|---------------|
| 1. Preparação | 1 dia | Nenhuma |
| 2. Data Layer | 2 dias | Etapa 1 |
| 3. Actions | 3 dias | Etapa 2 |
| 4. Hooks | 2 dias | Etapa 2-3 |
| 5. Editor | 1 dia | Etapa 4 |
| 6. discovery stores | 2 dias | Nenhuma |
| 7. discovery pages | 1 dia | Etapa 6 |
| 8. profile | 2 dias | Nenhuma |
| 9. Limpeza | 1 dia | Todas |
| 10. Guidelines | 1 dia | Nenhuma |

**Total estimado:** ~16 dias (2-3 sprints)

---

## 9. Referências

### Skills Utilizadas

- **Vercel React Best Practices**: Query bundling, server actions, cache
- **Frontend Design**: UI/Widget separation
- **Feature-Based Architecture**: Estrutura de features
- **Separation of Concerns**: Camadas domain/application/infrastructure

### Arquivos de Referência

- `AGENTS.md`: Estrutura atual das features
- `.opencode/specs/hooks-spec.md`: Convenção de hooks
- `.opencode/specs/server-actions-spec.md`: Convenção de server actions
- `.opencode/specs/stores-spec.md`: Convenção de stores

---

## 10. Conclusão

Este plano identifica **3 áreas críticas** que requerem atenção imediata:

1. 🔴 **book-dashboard data layer**: Remover `data/` e migrar para `application/queries/`
2. 🔴 **book-dashboard god actions**: Quebrar `user-books.actions.ts` em múltiplos arquivos
3. 🔴 **book-dashboard hooks**: Migrar hooks de fetch para server actions

A estrutura proposta segue as **Vercel React Best Practices** e mantém compatibilidade com:
- Next.js (App Router + Server Actions)
- Supabase
- TypeScript
- TailwindCSS
- Feature-based structure

**Recomendação:** Iniciar pela Etapa 2 (book-dashboard data layer) por ser a mais direta e de menor risco.