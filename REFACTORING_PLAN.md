# Plano de Refatoração Arquitetural - Conta.AI

## 📊 Diagnóstico Atual

### Problemas Identificados

| # | Problema | Localização | Severidade |
|---|----------|-------------|------------|
| 1 | Features grandes e acopladas | `book-dashboard` (45+ arquivos) | Alta |
| 2 | Mistura de responsabilidades | `hooks/` contém lógica de negócio | Alta |
| 3 | Duplicação de domain | `domain/` global + `features/*/domain/` | Média |
| 4 | Falta de boundary clara | Camadas não definidas | Alta |
| 5 | `app/` não é camada fina | Pages contém lógica de negócio | Média |
| 6 | `shared/` crescendo descontroladamente | 30+ componentes | Média |
| 7 | Duplicação entre features | `discovery` e `book-dashboard` | Média |

### Estrutura Atual

```
src/
├── app/                          # Pages (厚 - thick layer)
│   ├── dashboard/page.tsx       # 8 linhas - razoável
│   └── ...
├── features/                     # Feature-based
│   ├── book-dashboard/          # 45+ arquivos - MUITO GRANDE
│   │   ├── hooks/              # 10 hooks com lógica
│   │   ├── store/              # Stores
│   │   ├── actions/            # Server Actions
│   │   ├── application/        # Queries/Commands
│   │   ├── presentation/       # Widgets/UI/Pages
│   │   ├── domain/            # Duplicado
│   │   ├── editor/            # Editor (sub-feature)
│   │   └── utils/
│   ├── discovery/              # 35+ arquivos
│   ├── profile/                # 25+ arquivos
│   ├── reading/                # 30+ arquivos
│   └── library/                # 8 hooks
├── domain/                      # Entities, Repositories, UseCases
│   ├── entities/               # 6 entidades
│   ├── repositories/           # 4 repositórios
│   └── usecases/               # 6 use cases
├── shared/                      # Componentes reutilizáveis
│   ├── ui/                    # 20 componentes
│   ├── widgets/               # 10 widgets
│   ├── hooks/                 # 2 hooks
│   └── store/                 # 1 store
└── infrastructure/             # Integrações
    ├── database/              # Repositórios Supabase
    ├── api/                   # Actions
    └── mappers/                # Mappers
```

---

## 🎯 Princípios Arquiteturais

### 1. Feature Encapsulation
Cada feature deve ser independente e expor uma API pública mínima via `index.ts`.

### 2. Separação de Camadas (Clean Architecture)
```
presentation/    → UI, Widgets, Hooks
application/    → Queries, Commands (Use Cases)
domain/          → Entities, Types, Validators
infrastructure/  → APIs, Repositories
```

### 3. Hooks Leves
Hooks devem apenas orquestrar estado de UI, nunca conter regras de negócio.

### 4. App Router como Thin Layer
`app/` deve conter apenas composition de components, sem lógica.

### 5. Vertical Slice
Features devem ser divididas em sub-features quando crescerem demais.

---

## 🪜 Etapas de Refatoração

---

### Etapa 1: Refatoração de Hooks (Menor Risco)

**Objetivo**: Extrair regras de negócio dos hooks para application layer.

**Impacto**: Baixo - não afeta interface pública.

**Risco**: Baixo

**Estratégia de Validação**: Executar testes existentes, verificar funcionalidade.

**Possível Rollback**: Reverter importações nos componentes.

#### Ações

1. **Identificar hooks com lógica de negócio**

   ```
   hooks com lógica de negócio → mover para application/
   hooks com estado de UI → manter em hooks/
   ```

2. **Mover para application layer**

   | Antes | Depois |
   |-------|---------|
   | `use-book-dashboard.hook.ts` | `application/queries/dashboard.query.ts` |
   | `use-favorites.ts` | `application/commands/favorite.command.ts` |
   | `use-books.ts` | `application/queries/books.query.ts` |

3. **Manter apenas hooks de UI**

   ```typescript
   // ✅ Hook de UI - mantido em hooks/
   'use client'
   export function useSidebar() {
     const isOpen = useStore(s => s.isOpen)
     const toggle = useStore(s => s.toggle)
     return { isOpen, toggle }
   }
   
   // ❌ Hook com lógica - mover para application/
   // Este hook tem:
   // - fetch de dados
   // - filtering/transformação
   // - business rules
   // DEVE IR PARA application/queries/
   ```

#### Exemplo de Transformação

```typescript
// ANTES: src/features/book-dashboard/hooks/use-book-dashboard.hook.ts
export function useBookDashboard() {
  const { books, isLoading } = useBooks()
  const { query, hasQuery } = useSearch()
  
  // ✗ Lógica de negócio aqui
  const filteredBooks = useMemo(() => {
    if (!hasQuery) return books
    return books.filter(
      (book) => book.title.toLowerCase().includes(query.toLowerCase())
    )
  }, [books, query, hasQuery])
  
  return { filteredBooks }
}

// DEPOIS: src/features/book-dashboard/application/queries/dashboard.query.ts
export const getDashboardData = cache(async () => {
  const books = await getBooksCached()
  return books
})

// NOVO HOOK: src/features/book-dashboard/hooks/use-dashboard.ts
'use client'
export function useDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    getDashboardData().then(d => {
      setData(d)
      setIsLoading(false)
    })
  }, [])
  
  // ✗ Apenas estado de UI
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filtering delegate para aplicação
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return data?.books || []
    return filterBooks(data.books, searchQuery)
  }, [data, searchQuery])
  
  return { books: filteredBooks, isLoading, searchQuery, setSearchQuery }
}
```

---

### Etapa 2: Quebrar book-dashboard em Sub-features

**Objetivo**: Reduzir complexidade de 45+ arquivos para sub-features menores.

**Impacto**: Médio - reorganização interna.

**Risco**: Médio

**Estratégia de Validação**: Manter todos os exports do `index.ts` funcionando.

**Possível Rollback**: Reverter re-export no `index.ts`.

**Status**: ✅ CONCLUÍDA

#### Sub-features propostas

```
book-dashboard/
├── books/           # Catálogo de livros (publicação)
│   ├── application/ # Queries, Commands
│   ├── presentation/# Widgets, UI
│   └── hooks/       # Hooks específicos
├── editor/          # Editor de livros (já existe!)
│   ├── application/
│   ├── presentation/
│   └── hooks/
├── library/         # Biblioteca do usuário
│   ├── application/
│   ├── presentation/
│   └── hooks/
└── management/     # Gestão (dashboard, categories)
    ├── application/
    ├── presentation/
    └── hooks/
```

#### Estrutura Antes → Depois

**ANTES:**
```
book-dashboard/
├── hooks/
│   ├── use-books.ts
│   ├── use-book-dashboard.hook.ts
│   ├── use-categories.ts
│   ├── use-selected-book.ts
│   ├── use-editor-toolbar.ts
│   ├── use-editor-backup.ts
│   ├── use-editor-publish.ts
│   ├── use-book-editor.ts
│   ├── use-books-with-cache.ts
│   └── use-editor-backup-interval.ts
├── store/
│   ├── book-editor.store.ts
│   └── create-book-modal.store.ts
├── actions/
│   ├── books.actions.ts
│   ├── user-books.actions.ts
│   ├── user-favorites.actions.ts
│   └── upload-book-cover.action.ts
├── application/ (queries + commands)
├── presentation/ (widgets + ui)
└── domain/ (types, validators)
```

**DEPOIS:**
```
book-dashboard/
├── index.ts                    # Re-exports
├── books/                      # SUB-FEATURE: Catálogo
│   ├── application/
│   │   ├── queries/
│   │   │   ├── get-books.query.ts
│   │   │   └── get-categories.query.ts
│   │   └── commands/
│   │       ├── create-book.command.ts
│   │       └── publish-book.command.ts
│   ├── presentation/
│   │   ├── widgets/
│   │   │   ├── book-grid.widget.tsx
│   │   │   ├── category-content.widget.tsx
│   │   │   └── recommended-section.widget.tsx
│   │   └── ui/
│   │       ├── book-card.ui.tsx
│   │       └── metrics-card.ui.tsx
│   └── hooks/
│       └── use-books.ts
├── editor/                     # SUB-FEATURE: Editor
│   ├── application/
│   │   └── commands/
│   │       ├── save-content.command.ts
│   │       └── update-book.command.ts
│   ├── presentation/
│   │   ├── widgets/
│   │   │   ├── book-editor.widget.tsx
│   │   │   ├── editor-toolbar.widget.tsx
│   │   │   └── book-preview-modal.widget.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── use-book-editor.ts
│   │   ├── use-editor-toolbar.ts
│   │   └── use-editor-backup.ts
│   ├── store/
│   │   └── book-editor.store.ts
│   └── editor/
│       ├── plugins/
│       └── editor-theme.ts
└── library/                    # SUB-FEATURE: Biblioteca
    ├── application/
    ├── presentation/
    │   ├── widgets/
    │   │   ├── library-content.widget.tsx
    │   │   └── favorites-content.widget.tsx
    │   └── ui/
    └── hooks/
        ├── use-library-state.ts
        └── use-library-tabs.ts
```

#### Atualizar index.ts

```typescript
// src/features/book-dashboard/index.ts
// BOOKS
export { getBooks, getBooksCached } from './books/application/queries/get-books.query';
export { getCategories } from './books/application/queries/get-categories.query';
export { createBook, publishBook } from './books/application/commands';

// EDITOR
export { saveContent, updateBook } from './editor/application/commands';
export { BookEditor } from './editor/presentation/widgets/book-editor.widget';
export { EditorToolbar } from './editor/presentation/widgets/editor-toolbar.widget';

// LIBRARY
export { LibraryContent } from './library/presentation/widgets/library-content.widget';
export { FavoritesContent } from './library/presentation/widgets/favorites-content.widget';
export { useLibraryState } from './library/hooks/use-library-state';
```

---

### Etapa 3: Unificar domain/ global

**Objetivo**: Eliminar duplicação entre `domain/` global e `features/*/domain/`.

**Impacto**: Médio - consolidação.

**Risco**: Médio

**Estratégia de Validação**: Verificar que todos os imports funcionam.

**Possível Rollback**: Manter cópias em ambos os lugares temporariamente.

#### Ações

1. **Consolidar entities**

   ```
   domain/entities/         → entidades base (Book, User, etc.)
   features/*/domain/       → apenas validators específicos
   ```

2. **Mover validators para features**

   ```typescript
   // src/features/book-dashboard/domain/validators/book.validator.ts
   // Apenas validators específicos da feature
   export const createBookSchema = z.object({...})
   ```

3. **Manter apenas entities globais**

   ```typescript
   // src/domain/entities/book.entity.ts
   export interface Book {
     id: string
     title: string
     // ...
   }
   
   // src/domain/entities/index.ts
   export * from './book.entity'
   export * from './user.entity'
   export * from './favorite.entity'
   ```

4. **Remover domain de features** (após verificação)

   ```
   features/*/domain/ → remover, usar domain global
   ```

---

### Etapa 4: App como Thin Layer

**Objetivo**: Garantir que `app/` apenas componha componentes, sem lógica.

**Impacto**: Médio - refatoração de pages.

**Risco**: Baixo

**Estratégia de Validação**: Comparar antes/depois visualmente.

**Possível Rollback**: Copiar código de volta para pages.

#### Antes/Depois de pages

```typescript
// ANTES: src/app/dashboard/page.tsx
export default async function Page() {
  const books = await getCachedBooks()  // ✓ Okay - fetch dados
  
  // ✗ Lógica de transformação NO DEVE estar aqui
  const featuredBooks = books.slice(0, 6)
  const recentBooks = books.filter(b => b.isNew)
  
  // ✗ Filtering NO DEVE estar aqui
  const [selectedCategory, setSelectedCategory] = useState('')
  const filteredBooks = selectedCategory 
    ? books.filter(b => b.category === selectedCategory)
    : books
  
  return <Dashboard 
    featured={featuredBooks}
    filtered={filteredBooks}
  />
}

// DEPOIS: src/app/dashboard/page.tsx
export default async function Page() {
  // Apenas fetch - thin layer
  const { books, categories } = await getDashboardData()
  
  // Props passadas para componente de presentation
  return <DashboardView 
    books={books}
    categories={categories}
  />
}
```

#### Components de Presentation

```typescript
// src/features/book-dashboard/books/presentation/widgets/dashboard.view.tsx
// Este componente contém a lógica de UI

'use client'
export function DashboardView({ books, categories }) {
  // Lógica de UI aqui (filtering, sorting, etc)
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const filteredBooks = useMemo(() => {
    return selectedCategory 
      ? books.filter(b => b.category === selectedCategory)
      : books
  }, [books, selectedCategory])
  
  return (
    <div>
      <CategoryFilter 
        categories={categories} 
        onSelect={setSelectedCategory}
      />
      <BookGrid books={filteredBooks} />
    </div>
  )
}
```

---

### Etapa 5: Limpar shared/

**Objetivo**: Reduzir componentes em `shared/` para apenas os verdadeiramente reutilizáveis.

**Impacto**: Médio - reorganização.

**Risco**: Baixo

**Estratégia de Validação**: Verificar que componentes ainda funcionam.

**Possível Rollback**: Mover de volta para features.

#### Critérios para shared/

| Categoria | Exemplos | Mover para |
|-----------|----------|------------|
| UI puros | Button, Input, Avatar | shared/ui |
| Componentes genéricos | BookCard (se usado em múltiplas features) | shared/widgets |
| Components de features | DashboardShell (só em dashboard) | features/book-dashboard |
| Componentes específicos | FavoritesContent | features/discovery |

#### Componentes que DEVEM ficar em shared/

```
shared/ui/
├── button.tsx
├── input.tsx
├── avatar.tsx
├── badge.tsx
├── card.tsx
├── skeleton.tsx
└── container.tsx

shared/widgets/
├── book-card.widget.tsx        # Usado em várias features
└── category-filter-bar.widget.tsx
```

#### Componentes que DEVEM sair de shared/

```
shared/widgets/
├── dashboard-shell.widget.tsx   → features/book-dashboard/presentation/
├── favorites-book-list.widget.tsx → features/discovery/presentation/
├── library-tab-bar.widget.tsx  → features/library/presentation/
├── user-dropdown.widget.tsx    → features/auth/presentation/
```

---

### Etapa 6: Padronizar estrutura de features

**Objetivo**: Criar template padrão para novas features.

**Impacto**: Baixo - padronização.

**Risco**: Baixo

#### Template de Feature

```typescript
// src/features/[feature-name]/
// ├── index.ts                    # Re-exports públicos
// ├── application/                # Casos de uso
// │   ├── queries/
// │   │   ├── get-[resource].query.ts
// │   │   └── index.ts
// │   └── commands/
// │       ├── create-[resource].command.ts
// │       └── index.ts
// ├── domain/                      # Regras específicas
// │   ├── types/
// │   ├── validators/
// │   └── index.ts
// ├── infrastructure/             # Integrações específicas
// ├── presentation/
// │   ├── widgets/               # Componentes com estado
// │   ├── ui/                    # Componentes visuais puros
// │   └── pages/                 # Pages específicas (se necessário)
// ├── hooks/                     # Apenas hooks de UI
// │   ├── use-[feature].ts
// │   └── index.ts
// └── store/                      # Stores específicos (se necessário)
```

#### Exemplo: Feature Auth

```
features/auth/
├── index.ts
├── application/
│   ├── queries/
│   │   └── get-current-user.query.ts
│   └── commands/
│       ├── login.command.ts
│       ├── register.command.ts
│       └── logout.command.ts
├── domain/
│   └── validators/
│       └── auth.validator.ts
├── infrastructure/
│   └── supabase-auth.repository.ts
├── presentation/
│   ├── widgets/
│   │   ├── login-form.widget.tsx
│   │   └── register-form.widget.tsx
│   └── ui/
├── hooks/
│   └── use-auth.ts
└── store/
    └── auth.store.ts
```

---

## 📁 Nova Estrutura Proposta

```
src/
├── app/                          # Thin layer - apenas composição
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── library/
│   │   ├── favorites/
│   │   ├── editor/[id]/
│   │   └── downloads/
│   ├── book/[id]/
│   └── settings/
├── features/                     # Vertical slices
│   ├── auth/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── book-dashboard/           # Quebrado em sub-features
│   │   ├── books/
│   │   ├── editor/
│   │   ├── library/
│   │   └── management/
│   ├── discovery/
│   ├── library/
│   ├── profile/
│   ├── reading/
│   └── .template/
├── domain/                       # Global - apenas entities
│   ├── entities/
│   │   ├── book.entity.ts
│   │   ├── user.entity.ts
│   │   └── favorite.entity.ts
│   ├── repositories/             # Interfaces
│   └── usecases/                 # Use cases globais
├── shared/                       # Realmente reutilizáveis
│   ├── ui/                      # Componentes visuais puros
│   ├── widgets/                 # Componentes genéricos
│   ├── hooks/                   # Hooks utilitários
│   ├── store/                   # Stores globais
│   └── config/                  # Configurações
└── infrastructure/              # Integrações externas
    ├── database/                # Supabase repositories
    ├── api/                     # API clients
    └── mappers/                 # Data mappers
```

---

## 🧠 Boas Práticas Adicionais

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Query | `get-[resource].query.ts` | `get-books.query.ts` |
| Command | `[action]-[resource].command.ts` | `create-book.command.ts` |
| Hook | `use-[feature].ts` | `use-search.ts` |
| Widget | `[name].widget.tsx` | `book-card.widget.tsx` |
| UI | `[name].ui.tsx` | `button.ui.tsx` |
| Store | `[name].store.ts` | `sidebar.store.ts` |

### Organização de Use Cases

```typescript
// features/book-dashboard/application/queries/get-books.query.ts
import { cache } from 'react'
import { db } from '@/infrastructure/database'

export const getBooks = cache(async (category?: string) => {
  return db.books.findMany({
    where: category ? { category } : undefined
  })
})
```

### Organização de Hooks

```typescript
// ✗ hooks não devem conter lógica de negócio
// ✓ hooks devem orquestrar UI state

// use-search.ts - Hook de UI (OK)
'use client'
export function useSearch() {
  const [query, setQuery] = useState('')
  return { query, setQuery }
}

// ✗ use-book-dashboard.hook.ts - lógica de negócio (MOVER)
// DEVE ser: application/queries/dashboard.query.ts
```

---

## 🚀 Estratégia de Evolução Contínua

### Regras de Onboarding

1. **Nova feature**: Usar template de feature
2. **Nova lógica de negócio**: Criar em `application/` (query/command)
3. **Novo componente**: Decidir entre `shared/` ou feature local
4. **Dúvida**: Preferir feature local sobre shared

###Lint Arquitetural (Sugestão)

```typescript
// eslint-plugin-architecture.js
// Regra: hooks não devem chamar repositories diretamente
// Regra: app/ não deve ter useState
// Regra: features/*/domain/ não deve ter entities (usar domain/)
```

---

## ✅ Checklist de Execução

### Etapa 1: Hooks
- [x] Identificar hooks com lógica de negócio
- [x] Mover para `application/queries/` ou `application/commands/`
- [x] Manter apenas hooks de UI em `hooks/`
- [x] Atualizar imports nos componentes
- [x] Testar funcionalidade

### Etapa 2: Quebrar book-dashboard
- [x] Criar sub-directories: `books/`, `editor/`, `library/`
- [x] Mover arquivos relevantes para sub-directories
- [x] Atualizar `index.ts` com re-exports
- [x] Manter compatibilidade com imports existentes

### Etapa 3: Unificar domain
- [ ] Manter entities em `domain/`
- [ ] Mover validators para features
- [ ] Remover domain duplicado de features

### Etapa 4: Thin app layer
- [ ] Revisar todas as pages em `app/`
- [ ] Mover lógica de transformação para presentation
- [ ] Manter apenas fetch de dados em pages

### Etapa 5: Limpar shared/
- [ ] Avaliar cada componente em `shared/`
- [ ] Mover específicos para features
- [ ] Manter apenas genéricos

### Etapa 6: Padronização
- [ ] Criar template de feature
- [ ] Documentar padrões
- [ ] Revisar novas features contra padrões