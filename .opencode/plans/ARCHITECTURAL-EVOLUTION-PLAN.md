# Plano de Evolução Arquitetural - Conta.AI

## 🎯 Objetivo

Eliminar API Routes, centralizar em Server Actions, identificar Big Features e melhorar separação de responsabilidades.

---

## 🔍 API Routes Encontradas

### 1. `/src/app/api/books/route.ts`
- **Método:** GET
- **Lógica:** Chama `getBooksAction()` que combina livros do domain + user_books
- **Dependências:** Domain (GetBooksUseCase), Infrastructure (SupabaseBookRepository)
- **Ação:** ✅ Migrar para Server Action em `features/discovery/actions/`

### 2. `/src/app/api/user-books/route.ts`
- **Método:** GET (com query param `type`)
- **Lógica:** Filtra livros do usuário por tipo (my-stories/reading/completed)
- **Dependências:** Supabase direta
- **Ação:** ✅ Migrar para `features/book-dashboard/actions/` (já existe similar)

### 3. `/src/app/api/user-favorites/route.ts`
- **Método:** GET
- **Lógica:** Busca favoritos do usuário autenticado
- **Dependências:** `favorites.actions.ts` em infrastructure
- **Ação:** ✅ Migrar para `features/discovery/actions/`

### 4. `/src/app/api/health/route.ts`
- **Método:** GET
- **Lógica:** Health check simples
- **Ação:** ⚠️ Manter (não há necessidade de migration para health checks)

---

## 🔄 Plano de Migração para Server Actions

### Estratégia Global

1. **Duplicação zero**: Reutilizar actions existentes em `features/*/actions/`
2. **Mover para靠近 feature**: Actions devem estar próximas do domínio que servem
3. **Remover wrapper API**: Eliminar中间层 de API routes

### Etapas Seguras

#### Fase 1: Eliminar API Routes (baixo risco)
1. Remover `/src/app/api/health/route.ts` (manter se necessário)
2. Substituir chamadas em client components de API routes → Server Actions diretas

#### Fase 2: Consolidar Actions em Features
| API Route | Nova Localização | Action Existente |
|-----------|------------------|------------------|
| `/api/books` | `features/discovery/actions/get-books.action.ts` | ❌ Criar |
| `/api/user-books` | `features/book-dashboard/actions/user-books.actions.ts` | ✅ Já existe |
| `/api/user-favorites` | `features/discovery/actions/favorites.actions.ts` | ❌ Mover de infrastructure |

#### Fase 3: Limpar Infrastructure
- Mover `src/infrastructure/api/favorites.actions.ts` → `features/discovery/actions/`
- Mover `src/infrastructure/api/books.actions.ts` → `features/discovery/actions/`
- Mover `src/infrastructure/api/user-books.actions.ts` → `features/book-dashboard/actions/`
- Remover pasta `src/infrastructure/api/` após migração

---

## 🧩 Big Features Identificadas

### 1. `book-dashboard` - PROBLEMA CRÍTICO

**Responsabilidades Atuais:**
- Gerenciamento de livros do usuário (CRUD)
- Editor de conteúdo (Lexical)
- Biblioteca pessoal (favoritos, downloads, categorias)
- Upload de capas
- Auto-save
- Preview de livros
- Recomendações

**Problemas Identificados:**
- Estrutura interna inconsistente (múltiplas pastas亂):
  - `actions/`, `application/`, `books/`, `books/presentation/`, `config/`, `data/`, `editor/`, `editor/hooks/`, `editor/plugins/`, `feature/`, `feature/books/`, `feature/books/application/`, `feature/editor/`, `feature/library/`, `hooks/`, `pages/`, `presentation/`, `store/`, `ui/`, `widgets/`
- 509 linhas em um único arquivo de actions (`user-books.actions.ts`)
- Alto acoplamento entre editor e gerenciamento de livros

**Sugestão de Divisão:**

```
src/features/
├── book-dashboard/        # MANTER (dashboard geral)
│   ├── actions/          # Operações do usuário
│   ├── hooks/            # Hooks específicos
│   └── widgets/          # Widgets do dashboard
│
├── library/              # NOVA - Gerenciamento pessoal
│   ├── actions/          # CRUD de livros do usuário
│   ├── hooks/            # use-library-*, use-user-books
│   ├── widgets/          # LibraryContent, Favorites, Downloads
│   └── ui/               # Componentes visuais puros
│
├── editor/               # NOVA - Editor de livros
│   ├── actions/          # save-content, auto-save, publish
│   ├── hooks/            # use-book-editor, use-editor-backup
│   ├── plugins/          # Plugins Lexical
│   ├── widgets/          # BookEditor, Toolbar, Preview
│   └── ui/               # Componentes do editor
│
└── book-details/         # NOVA - Detalhes e recomendação
    ├── widgets/          # BookDetailsPanel, DetailsModal
    └── ui/               # BookCard, RatingStars
```

### 2. `discovery` - Estrutura Boa

**Status:** Estrutura relativamente limpa
- `hooks/`, `pages/`, `ui/`, `widgets/`

**Melhorias Sugeridas:**
- Mover actions de `infrastructure/` para `features/discovery/actions/`
- Criar pasta `actions/` com Server Actions para busca/favoritos

### 3. `profile` - Razoável mas com aninhamento

**Problema:** Sub-pasta `profile/reading/` com mesma estrutura
- `profile/reading/hooks/`, `profile/reading/ui/`, `profile/reading/widgets/`

**Sugestão:**
- Mover `profile/reading/*` para `features/reading/` (já existe lá)
- Ou criar `features/reading-preferences/` como feature独立的

### 4. `reading` - Estrutura Boa

**Status:** Bem organizada
- `actions/`, `hooks/`, `ui/`, `widgets/`, `utils/`

**Observação:** Já possui Server Actions em `actions/`

---

## 🏗️ Ajustes Arquiteturais

### Problemas Estruturais Identificados

1. **Duplicação de responsabilidades entre `domain` e `infrastructure`:**
   - `domain/usecases/` possui lógica mas actions em `infrastructure/api/` duplicam
   - Actions deveriam usar usecases, não query direta no Supabase

2. **Pasta `infrastructure/` desnecessária para actions:**
   - Server Actions são "application layer", não "infrastructure"
   - Deveriam estar em `features/*/actions/`

3. **Acoplamento:**
   - `discovery/hooks/use-favorites.ts` → importa de `@/infrastructure/api/favorites.actions`
   - Deve importar de feature local

4. **Domain violando fronteiras:**
   - Domain entities possuem getters/setters? Verificar

### Melhorias Sugeridas

1. **Server Actions devem usar Use Cases:**
   ```typescript
   // ❌ Atual (em infrastructure/)
   async function getBooksAction() {
     const supabase = await getSupabaseServerClient();
     // ... query direta
   }
   
   // ✅ Ideal (em features/)
   async function getBooksAction() {
     const bookRepository = new SupabaseBookRepository();
     const getBooksUseCase = new GetBooksUseCase(bookRepository);
     return getBooksUseCase.execute({});
   }
   ```

2. **Separar Infrastructure (repositórios) de Application (actions):**
   - Repositórios: `src/infrastructure/database/`
   - Actions: `src/features/*/actions/`

3. **Criar barrel exports em features:**
   - `features/discovery/actions/index.ts`
   - `features/discovery/hooks/index.ts`

---

## 🗺️ Novo Plano de Refatoração (V2) - EXECUTED

### Fase 6: Separar Backend (server/) ✅ COMPLETO
- [x] 6.1 Criar pasta `src/server/`
- [x] 6.2 Mover `domain/` → `src/server/domain/`
- [x] 6.3 Mover `infrastructure/` → `src/server/infrastructure/`
- [x] 6.4 Atualizar todos os imports na codebase (`@/domain/` → `@/server/domain/`)

**Resultado:**
- Estrutura final separada: `frontend/` (app, features, shared) vs `backend/` (server/)
- Build compilou com sucesso

---

### Fase 1: Limpeza de API Routes (Menor Risco) ✅ COMPLETO
- [x] 1.1 Mapear todas as chamadas de API routes → Server Actions existentes
- [x] 1.2 Substituir em client components
- [x] 1.3 Remover API routes (exceto health)

**Resultado:** 
- Removidas 3 API routes: `/api/books`, `/api/user-books`, `/api/user-favorites`
- Apenas `/api/health` permanece

### Fase 2: Migrar Actions para Features (Médio Risco) ✅ COMPLETO
- [x] 2.1 Criar pasta `features/discovery/actions/`
- [x] 2.2 Mover `favorites.actions.ts` → `features/discovery/actions/favorites.actions.ts`
- [x] 2.3 Mover `books.actions.ts` → `features/discovery/actions/books.actions.ts`
- [x] 2.4 Mover `user-books.actions.ts` → `features/library/actions/user-books.actions.ts`
- [x] 2.5 Mover `reading.actions.ts` → `features/reading/actions/reading.actions.ts`
- [x] 2.6 Atualizar imports em toda a codebase
- [x] 2.7 Limpar `src/infrastructure/api/`

**Resultado:**
- Pasta `infrastructure/api/` removida
- Actions agora em: `features/discovery/actions/`, `features/library/actions/`, `features/reading/actions/`

---

### Fase 3: Dividir Big Feature `book-dashboard` (Alto Risco) - ✅ COMPLETO
Sub-dividir em fases menores:

#### Fase 3.1: Análise e Mapeamento
- [x] 3.1.1 Mapear dependências entre sub-módulos
- [x] 3.1.2 Identificar dependências circulares

#### Fase 3.2: Criar Estrutura de Novas Features
- [x] 3.2.1 Criar `features/library/` (se ainda não existe ou configurar)
- [x] 3.2.2 Criar `features/editor/`
- [x] 3.2.3 Criar `features/book-details/`

#### Fase 3.3: Mover Componentes
- [x] 3.3.1 Mover widgets de biblioteca para `library`
- [x] 3.3.2 Mover editor e plugins para `editor`
- [x] 3.3.3 Mover detalhes e recomendações para `book-details`

#### Fase 3.4: Limpeza Estrutural
- [x] 3.4.1 Remover pastas duplicadas (`feature/*`, `books/*`, `presentation/*`)
- [x] 3.4.2 Atualizar todas as rotas e imports

### Fase 4: Consolidação de Domain (Refinamento) - ✅ COMPLETO
Sub-dividido em fases menores:

#### Fase 4.1: Analisar queries diretas ao Supabase
- [x] 4.1.1 Mapear todas as actions com queries diretas
- [x] 4.1.2 Identificar padrão de uso

#### Fase 4.2: Criar Piloto UserBookRepository
- [x] 4.2.1 Criar `UserBookRepository` interface (`src/server/domain/repositories/user-book.repository.ts`)
- [x] 4.2.2 Criar `SupabaseUserBookRepository` (`src/server/infrastructure/database/supabase-user-book.repository.ts`)
- [x] 4.2.3 Exportar no index de database

#### Fase 4.3: Migrar library/actions para usar repository
- [x] 4.3.1 Migrar `features/library/actions/user-books.actions.ts` para usar repository
- [x] 4.3.2 Validar build

#### Fase 4.4: Migrar discovery/actions para usar repository
- [x] 4.4.1 Criar `FavoriteRepository` interface e implementação
- [x] 4.4.2 Migrar `features/discovery/actions/favorites.actions.ts` para usar repository
- [x] 4.4.3 Validar build

#### Fase 4.5: Migrar reading/actions para usar repository
- [x] 4.5.1 Migrar `reading.actions.ts`, `get-reading-progress.action.ts`, `save-reading-progress.action.ts`
- [x] 4.5.2 Validar build

#### Fase 4.6: Migrar profile/actions para usar repository
- [x] 4.6.1 Migrar `profile.actions.ts` para usar `SupabaseUserRepository`
- [x] 4.6.2 Validar build

#### Fase 4.7: Migrar Storage actions
- [x] 4.7.1 Criar `StorageRepository` interface e implementação
- [x] 4.7.2 Migrar `profile/upload.actions.ts` para usar repository
- [x] 4.7.3 Migrar `profile/upload-avatar.action.ts` para usar repository
- [x] 4.7.4 Validar build

**Arquivos restantes (pendentes):**
- book-dashboard/actions/upload-book-cover.action.ts (storage) ✅ Migrado para usar StorageRepository

**Nota:** auth/auth.actions.ts não migrado pois já usa getSupabaseServerClient custom com cookies - é uma camada de abstração própria.

### Fase 5: Limpeza Final - ✅ COMPLETO
- [x] 5.1 Verificar que todas as features seguem padrão (build passou)
- [x] 5.2 Documentar nova estrutura

### Nova Estrutura de Repositórios

```
src/server/domain/repositories/
├── book.repository.ts           (existente)
├── user.repository.ts       (existente)
├── reading.repository.ts    (existente)
├── user-book.repository.ts  ← NOVO (Fase 4.2)
├── favorite.repository.ts ← NOVO (Fase 4.4)
└── storage.repository.ts ← NOVO (Fase 4.7)

src/server/infrastructure/
├── database/
│   ├── supabase-book.repository.ts
│   ├── supabase-user.repository.ts
│   ├── supabase-reading.repository.ts
│   ├── supabase-user-book.repository.ts
│   ├── supabase-favorite.repository.ts
│   └── supabase-storage.repository.ts
└── storage/
    └── supabase-storage.repository.ts
```

### Padrão de Migration

Cada nova feature que precisa de database deve seguir:
1. Criar interface em `src/server/domain/repositories/[feature].repository.ts`
2. Criar implementação em `src/server/infrastructure/database/supabase-[feature].repository.ts`
3. Exportar no index de database
4. Usar em actions: `import { Supabase[Feature]Repository } from "@/server/infrastructure/database"`

---

## 📋 Plano Detalhado: user-books.actions.ts (509 linhas)

**Objetivo:** Migrar para usar UserBookRepository existente

### Sub-fases (baixo risco, entregas incrementais):

#### Fase 4.8.1: Functions de Leitura (MENOR RISCO)
- [x] 4.8.1.1 Migrar `getUserBooks()` para usar repository
- [x] 4.8.1.2 Migrar `getUserReadingBooks()` para usar repository
- [x] 4.8.1.3 Migrar `getUserCompletedBooks()` para usar repository
- [x] 4.8.1.4 Migrar `getPublishedBooks()` para usar repository
- [x] 4.8.1.5 Migrar `getBookById()` para usar repository

#### Fase 4.8.2: Functions de Escrita (MÉDIO RISCO)
- [x] 4.8.2.1 Migrar `createUserBook()` para usar repository
- [x] 4.8.2.2 Migrar `updateUserBook()` para usar repository
- [x] 4.8.2.3 Migrar `saveBookContent()` para usar repository
- [x] 4.8.2.4 Migrar `deleteUserBook()` para usar repository

#### Fase 4.8.3: Functions de Estado (MÉDIO RISCO)
- [x] 4.8.3.1 Migrar `publishBook()` para usar repository
- [x] 4.8.3.2 Migrar `markAsReading()` para usar repository
- [x] 4.8.3.3 Migrar `markAsCompleted()` para usar repository
- [x] 4.8.3.4 Migrar `updateReadingProgress()` para usar repository

#### Fase 4.8.4: Functions Combinadas (ALTO RISCO)
- [x] 4.8.4.1 Migrar `getCurrentUserBooks()` para usar repository
- [x] 4.8.4.2 Remover functions duplicadas em user-favorites.actions.ts (se existirem)
- [x] 4.8.4.3 Validar build final

**Entregas por fase:** ~40-50 linhas por fase (baixo risco)

---

## 📋 Priorização

| Fase | Risco | Impacto | Tempo Estimado |
|------|-------|---------|----------------|
| Fase 1 | Baixo | Alto | 1 dia |
| Fase 2 | Baixo | Médio | 1 dia |
| Fase 3 | Alto | Alto | 2-3 dias |
| Fase 4 | Médio | Médio | 1 dia |
| Fase 5 | Baixo | Baixo | 0.5 dia |

---

## 🔗 Dependencies a Atualizar

Após migração, atualizar imports em:
- `src/features/discovery/hooks/use-favorites.ts`
- `src/features/book-dashboard/widgets/*` (múltiplos)
- Qualquer componente que use `@/infrastructure/api/*`

---

## ✅ Critérios de Sucesso

1. Zero API routes (exceto health)
2. Todas Server Actions em `features/*/actions/`
3. Domain + Infrastructure em `server/` (separados do frontend)
4. Features coesas e desacopladas
5. Estrutura consistente entre features