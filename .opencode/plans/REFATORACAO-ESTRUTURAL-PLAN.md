# PLAN.md — Refatoração Estrutural do Projeto Conta.AI

## Status da Refatoração

| Fase | Status | Observação |
|------|--------|-------------|
| Fase 1 - screens/, landing/ | ✅ Concluído | Não existiam no projeto |
| Fase 2 - Hooks em shared | ✅ Concluído | Já estavam em features/library |
| Fase 3 - Stores em shared | ✅ Concluído | Apenas sidebar.store em shared (global) |
| Fase 4 - book-dashboard | ✅ Concluído | domain/types, validators, infrastructure criados |
| Fase 5 - Discovery/Profile | ✅ Concluído | application/queries/commands criados |
| Fase 6 - API Routes → Server Actions | ✅ Concluído | Migradas para application layer |
| Revisão Final | ✅ Concluído | Verificada conformidade com FEATURES-REFACTORING-PLAN |

## 1. Análise da Codebase Atual

### 1.1 Problemas Identificados

| Problema | Localização | Impacto |
|----------|-------------|---------|
| **Hooks duplicados/específicos em shared** | `shared/hooks/use-library-state.ts`, `use-library-tabs.ts`, `use-favorites.ts` | Acoplamento indevido - lógica de domínio em shared |
| **Redundância screens/** | `src/screens/` | Duplicação de rotas já existentes em `app/` |
| **Redundância landing/** | `src/landing/` vs `app/landingpage/` | Dois lugares para mesma funcionalidade |
| **Componentes duplicados** | `shared/ui/book-card.tsx` e `shared/widgets/book-card.widget.tsx` | Duplicação de responsabilidade |
| **Store com lógica de domínio** | `shared/store/favorites.store.ts`, `search.store.ts` | Zustand stores deveriam estar em features |
| **API routes isoladas** | `app/api/*` | Server actions misturadas com API routes |
| **Nomenclatura inconsistente** | Alguns `.tsx` sem sufixo `.ui.` ou `.widget.` | Dificuldade em identificar tipo de componente |

### 1.2 Anti-Patterns

1. **Shared hooks com estado de domínio**: `use-library-tabs.ts` gerencia estado específico de biblioteca
2. **Zustand stores em shared para domínios específicos**: `favorites.store.ts` deveria estar em `features/discovery`
3. **Mistura de Server Actions e API Routes**: Alguns endpoints em `app/api/` poderiam ser Server Actions

### 1.3 Acoplamentos Indevidos

- `library-content.widget.tsx` depende de hooks de `shared/hooks/` que são específicos de biblioteca
- `BookCard` em `shared/widgets` usa tipos de `features/book-dashboard`

---

## 2. Objetivos da Refatoração

| Objetivo | Justificativa |
|----------|---------------|
| **Mover hooks específicos para features** | Reduzir acoplamento, melhorar coesão |
| **Eliminar redundâncias** | Remover `screens/` e consolidar `landing/` |
| **Consolidar stores por domínio** | Cada featuregerencia seu próprio estado |
| **Padronizar nomenclatura** | Clareza imediata sobre tipo de arquivo |
| **Server Actions como padrão** | Substituir API routes por Server Actions onde aplicável |

---

## 3. Nova Arquitetura Proposta

### 3.1 Estrutura Final

```
src/
├── app/                      # Rotas Next.js (App Router)
│   ├── layout.tsx
│   ├── page.tsx              # Landing redireciona para app/
│   ├── (auth)/               # Grupo de rotas auth
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Grupo de rotas autenticadas
│   │   ├── layout.tsx
│   │   ├── library/
│   │   ├── favorites/
│   │   └── settings/
│   ├── book/[id]/            # Leitura de livro
│   └── api/                  # Apenas API routes necessárias (webhooks)
│
├── features/                 # Feature-Based Design
│   ├── auth/                 # Autenticação
│   │   ├── actions/         # Server Actions (login, register, logout)
│   │   ├── widgets/          # LoginForm, RegisterForm
│   │   ├── hooks/            # use-auth
│   │   └── types/
│   ├── discovery/            # Descoberta de livros
│   │   ├── actions/
│   │   ├── widgets/
│   │   ├── ui/
│   │   ├── hooks/
│   │   └── types/
│   ├── library/              # Biblioteca do usuário
│   │   ├── actions/
│   │   ├── widgets/
│   │   ├── hooks/            # use-library-tabs (MOVÉR)
│   │   └── types/
│   ├── reading/              # Experiência de leitura
│   │   ├── actions/
│   │   ├── widgets/
│   │   ├── ui/
│   │   ├── hooks/
│   │   └── types/
│   ├── profile/              # Perfil do usuário
│   │   ├── actions/
│   │   ├── widgets/
│   │   └── hooks/
│   └── book-editor/          # Editor de livros
│       ├── actions/
│       ├── widgets/
│       └── hooks/
│
├── shared/                   # Recursos globais reutilizáveis
│   ├── ui/                   # Componentes visuais puros (sem estado)
│   │   ├── button.ui.tsx
│   │   ├── avatar.ui.tsx
│   │   └── ...
│   ├── widgets/              # Componentes com estado ( Zustand, useState)
│   │   └── ...
│   ├── hooks/                # Hooks GENÉRICOS (use-hydrated, use-click-outside)
│   ├── stores/               # Stores GLOBAIS (ui-theme, auth)
│   ├── lib/                  # Configurações (supabase, db)
│   └── types/                # Tipos compartilhados
│
└── assets/                   # Arquivos estáticos
```

### 3.2 Responsabilidade por Camada

| Camada | Responsabilidade |
|--------|-----------------|
| `app/` | Roteamento, layouts, Server Components que orquestram features |
| `features/*/` | Lógica de negócio, estado, Server Actions do domínio |
| `shared/ui/` | Componentes puramente visuais (presentational) |
| `shared/widgets/` | Componentes com estado que orquestram UI components |
| `shared/hooks/` | Hooks genéricos (não específicos de domínio) |
| `shared/stores/` | Stores globais (tema, auth) |

---

## 4. Plano de Migração (Passo a Passo)

### Fase 1: Limpeza de Redundâncias (Baixo Risco)

1. **Remover `src/screens/`**
   - Arquivos já existem em `app/`
   - Verificar se há alguma lógica adicional
   
2. **Consolidar landing**
   - Manter apenas `app/landingpage/` ou `src/landing/`
   - Recomendado: usar `app/landingpage/` como rota principal

3. **Remover API routes duplicadas**
   - Migrar para Server Actions onde possível

### Fase 2: Refatoração de Hooks (Médio Risco)

| Hook Atual | Destino Novo |
|------------|--------------|
| `shared/hooks/use-library-tabs.ts` | `features/library/hooks/use-library-tabs.ts` |
| `shared/hooks/use-library-state.ts` | `features/library/hooks/use-library-state.ts` |
| `shared/hooks/use-favorites.ts` | `features/discovery/hooks/use-favorites.ts` |
| `shared/hooks/use-favorites-search.ts` | `features/discovery/hooks/use-favorites-search.ts` |
| `shared/hooks/use-user-books.ts` | `features/library/hooks/use-user-books.ts` |
| `shared/hooks/use-search.ts` | `features/discovery/hooks/use-search.ts` |
| `shared/hooks/use-category-filter.ts` | `features/discovery/hooks/use-category-filter.ts` |

### Fase 3: Consolidação de Stores (Médio Risco)

| Store Atual | Destino Novo |
|-------------|--------------|
| `shared/store/favorites.store.ts` | `features/discovery/stores/favorites.store.ts` |
| `shared/store/search.store.ts` | `features/discovery/stores/search.store.ts` |
| `shared/store/category-cache.store.ts` | `features/discovery/stores/category-cache.store.ts` |
| `shared/store/pagination-cache.store.ts` | `features/discovery/stores/pagination-cache.store.ts` |
| Manter: `sidebar.store.ts` | ✅ Manter em shared (é global) |

### Fase 4: Padronização de Componentes (Médio Risco)

1. **Unificar componentes duplicados**
   - `shared/ui/book-card.tsx` + `shared/widgets/book-card.widget.tsx` → Escolher um padrão e migrar

2. **Adicionar sufixos faltantes**
   - Arquivos sem `.ui.` ou `.widget.` rename para convenção

### Fase 5: Limpeza Final

1. Remover imports quebrados após migração
2. Verificar funcionamento com `bun run dev`
3. Executar `bun run lint` para validação

---

## 5. Exemplos Práticos

### 5.1 Exemplo: Biblioteca (Antes → Depois)

**ANTES** (acoplado):
```typescript
// src/features/book-dashboard/widgets/library-content.widget.tsx
import { useLibraryTabs } from "@/shared/hooks/use-library-tabs"; // ❌ Em shared
import { useUserBooks } from "@/shared/hooks/use-user-books";       // ❌ Em shared
import { useLibraryState } from "@/shared/hooks/use-library-state"; // ❌ Em shared
```

**DEPOIS** (coeso):
```typescript
// src/features/library/widgets/library-content.widget.tsx
import { useLibraryTabs } from "@/features/library/hooks/use-library-tabs";     // ✅ Em feature
import { useUserBooks } from "@/features/library/hooks/use-user-books";         // ✅ Em feature
import { useLibraryState } from "@/features/library/hooks/use-library-state"; // ✅ Em feature
```

### 5.2 Exemplo: Separação UI vs Widget

**UI (visual puro)**:
```typescript
// src/shared/ui/book-cover.ui.tsx
type BookCoverProps = {
  title: string;
  coverUrl?: string;
  coverColor: string;
  size?: "sm" | "md" | "lg";
};

export function BookCover({ title, coverUrl, coverColor, size = "md" }: BookCoverProps) {
  // Apenas renderização, sem estado
  return <div style={{ backgroundColor: coverColor }}>...</div>;
}
```

**Widget (com lógica)**:
```typescript
// src/features/library/widgets/book-card.widget.tsx
type BookCardProps = {
  book: UserBook;
  onDelete: (id: string) => void;
};

export function BookCard({ book, onDelete }: BookCardProps) {
  const [deleting, setDeleting] = useState(false); // Estado local
  const router = useRouter(); // Hooks de router
  
  return <BookCover ... />; // Compõe UI
}
```

---

## 6. Boas Práticas e Convenções

### 6.1 Naming Conventions

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente UI | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `user-dropdown.widget.tsx` |
| Page | `page.tsx` | `library/page.tsx` |
| Hook | `use-*.ts` | `use-sidebar.ts` |
| Store | `*.store.ts` | `ui-theme.store.ts` |
| Action | `*.action.ts` | `get-books.action.ts` |
| Type | `*.types.ts` | `book.types.ts` |

### 6.2 Regras de Separação

1. **UI nunca tem estado** - apenas recebe props e renderiza
2. **Widget gerencia estado** - pode usar hooks, Zustand, event handlers
3. **Hooks em shared apenas se genéricos** - `useClickOutside`, `useHydrated`
4. **Stores em shared apenas se globais** - tema, sidebar, auth

### 6.3 Estrutura de Feature

```
features/<feature>/
├── actions/           # Server Actions
│   ├── get-*.action.ts
│   └── update-*.action.ts
├── widgets/           # Componentes com lógica
├── ui/                # Componentes específicos visuais
├── hooks/             # Hooks específicos do domínio
├── stores/            # Zustand stores do domínio
├── types/             # Tipos do domínio
└── index.ts           # Exports públicos
```

---

## 7. Sugestões de Evolução Futura

### 7.1 Server Actions como Padrão (✅ CONCLUÍDO)
- Migrar todas as API routes para Server Actions
- Usar `revalidatePath` para cache manual
- Estrutura `application/queries/` para operações de leitura (cache)
- Estrutura `application/commands/` para operações de escrita

### 7.2 React Server Components
- Identificar widgets que podem ser Server Components
- Reduzir JavaScript enviado ao cliente

### 7.3 Code Splitting
- Aplicar `dynamic()` para componentes pesados (editor Lexical)
- Lazy load de modais

### 7.4 Testes
- Adicionar testes unitários para hooks e stores
- Testar Server Actions isoladamente

---

## Resumo das Ações

| Fase | Ações | Risco | Status |
|------|-------|-------|--------|
| 1 | Remover `screens/`, consolidar `landing/` | Baixo | ✅ |
| 2 | Mover hooks para features | Médio | ✅ |
| 3 | Mover stores para features | Médio | ✅ |
| 4 | Padronizar componentes | Médio | ✅ |
| 5 | Migrar API routes → Server Actions | Médio | ✅ |
| 6 | Limpeza final | Baixo | ✅ |

**Tempo estimado**: 2-3 dias de implementação gradual

---

## 8. Migração de API Routes para Server Actions (CONCLUÍDO em 08/04/2026)

### 8.1 Problema Identificado

As API routes em `app/api/` estavam duplicando funcionalidades da application layer:

| API Route | Equivalent Application | Status |
|-----------|------------------------|--------|
| `app/api/books` | `application/queries/get-books.query.ts` | Duplicado |
| `app/api/user-books` | `application/queries/get-user-books.query.ts` | Duplicado |
| `app/api/user-favorites` | `discovery/application/queries/search-books.query.ts` | Duplicado |

### 8.2 Por que Migrar?

| Aspecto | API Routes | Server Actions |
|---------|-----------|----------------|
| **Complexidade** | Requer next.config.ts e route handlers | Função simples + call direta |
| **Performance** | HTTP overhead | Chamada direta, sem JSON parse |
| **TypeScript** | Tipagem manual | Tipagem automática via função |
| **Cache** | Manual (Cache-Control) | Integrado com `cache()` do React |
| **Revaliação** | Manual | `revalidatePath()` automático |

### 8.3 O que foi Migrado

1. **Removido**: `app/api/books`, `app/api/user-books`, `app/api/user-favorites`
2. **Atualizado imports** em:
   - `downloads-content.widget.tsx`
   - `favorites-content.widget.tsx`
   - `header.ui.tsx`

### 8.4 Estrutura Final

```
src/
├── features/
│   └── [feature]/
│       └── application/
│           ├── queries/      # GET (leitura) - cache()
│           └── commands/     # POST/PUT/DELETE (escrita)
└── app/                      # Apenas rotas de páginas
    └── api/
        └── health/           # Mantido (healthcheck)
```

---

*Documento atualizado em 08/04/2026 - Refatoração concluída*
