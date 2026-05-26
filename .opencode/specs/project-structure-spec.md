# Project Structure Specification

## Description
Este documento define a especificação para organização da estrutura do projeto Conta.AI.

## Baseado em
- AGENTS.md do projeto
- Next.js App Router Best Practices

---

## 1. Estrutura Principal

```
conta-ai/
├── .opencode/                      # Configurações do OpenCode
│   ├── specs/                     # Especificações
│   │   ├── database-spec.md
│   │   ├── ui-component-spec.md
│   │   ├── widget-component-spec.md
│   │   ├── hooks-spec.md
│   │   ├── stores-spec.md
│   │   ├── server-actions-spec.md
│   │   ├── testing-spec.md
│   │   ├── react-testing-spec.md
│   │   ├── nextjs-best-practices-spec.md
│   │   ├── accessibility-spec.md
│   │   ├── page-routing-spec.md
│   │   └── project-structure-spec.md
│   └── plans/                     # Planos de trabalho
│
├── .agents/                       # Skills do agente
│   └── skills/
│
├── .next/                         # Build output (gerado)
├── public/                        # Arquivos estáticos
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── app/                       # Next.js App Router
│   ├── features/                  # Funcionalidades por domínio
│   ├── shared/                    # Componentes compartilhados
│   └── utils/                     # Utilitários
│
├── supabase/                      # Configurações Supabase
│   ├── migrations/                # Migrações de banco
│   └── snippets/                  # Snippets SQL
│
├── .env.example                   # Variáveis de ambiente exemplo
├── .gitignore
├── bun.lockb
├── next.config.ts                # Configuração Next.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts              # Configuração testes
```

---

## 2. Estrutura src/app

```
src/app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Landing page
├── loading.tsx                   # Root loading (skeleton)
├── error.tsx                     # Root error boundary
├── not-found.tsx                 # Global 404
├── globals.css                   # Estilos globais
│
├── (auth)/                       # Grupo de autenticação
│   ├── layout.tsx                # Shared auth layout
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── dashboard/                    # Área autenticada
│   ├── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── library/
│   ├── favorites/
│   ├── downloads/
│   ├── settings/
│   ├── category/
│   └── editor/
│       └── [id]/
│
├── book/
│   └── [id]/
│
├── explore/                      # Explorar livros
│   ├── page.tsx
│   └── loading.tsx
│
├── my-session/                   # Sessão anônima
│   ├── page.tsx
│   └── loading.tsx
│
├── settings/                     # Configurações
├── downloads/                    # Downloads públicos
├── library/                      # Biblioteca pública
├── category/                     # Categorias
├── favorites/                    # Favoritos públicos
├── book-dashboard/               # Dashboard de livros
├── landingpage/                  # Landing page institucional
└── api/                          # API routes
    ├── health/
    │   └── route.ts
    └── auth/
        └── callback/
            └── route.ts
```

---

## 3. Estrutura src/features

```
src/features/
├── auth/                        # Autenticação
│   ├── actions/
│   ├── hooks/
│   └── widgets/
│
├── profile/                     # Perfil do usuário
│   ├── actions/
│   ├── hooks/
│   ├── pages/
│   ├── reading/
│   ├── ui/
│   └── widgets/
│
├── book-dashboard/              # Dashboard de livros (legado)
│   ├── actions/
│   ├── config/
│   ├── data/
│   ├── hooks/
│   ├── store/
│   ├── ui/
│   └── widgets/
│
├── library/                     # Biblioteca pessoal
│   ├── actions/
│   ├── hooks/
│   └── widgets/
│
├── discovery/                   # Descoberta de livros
│   ├── actions/
│   ├── hooks/
│   ├── pages/
│   ├── ui/
│   └── widgets/
│
├── editor/                      # Editor Lexical
│   ├── hooks/
│   ├── plugins/
│   ├── store/
│   └── widgets/
│
├── book-details/                # Detalhes do livro
│   ├── actions/
│   ├── ui/
│   └── widgets/
│
├── reading/                     # Leitura (progresso)
│   ├── actions/
│   ├── hooks/
│   ├── ui/
│   ├── utils/
│   └── widgets/
│
├── public-books/                # Livros públicos
│   ├── actions/
│   ├── hooks/
│   ├── types/
│   ├── ui/
│   └── widgets/
│
├── author-follow/               # Seguir autores
│   ├── actions/
│   ├── hooks/
│   └── widgets/
│
├── notifications/               # Notificações (toast)
│   ├── actions/
│   ├── hooks/
│   ├── types/
│   ├── ui/
│   └── widgets/
│
└── session-library/             # Sessão anônima
    ├── actions/
    ├── hooks/
    ├── lib/
    ├── store/
    ├── types/
    ├── ui/
    └── widgets/
```

---

## 4. Estrutura src/shared

```
src/shared/
├── ui/                          # Componentes UI (puros)
│   ├── avatar.ui.tsx
│   ├── badge.ui.tsx
│   ├── book-card.ui.tsx
│   ├── book-cover.ui.tsx
│   ├── book-grid.ui.tsx
│   ├── book-search.ui.tsx
│   ├── button.ui.tsx
│   ├── category-header.ui.tsx
│   ├── container.ui.tsx
│   ├── empty-favorites-state.ui.tsx
│   ├── empty-library-state.ui.tsx
│   ├── favorite-button.ui.tsx
│   ├── favorites-header.ui.tsx
│   ├── favorites-search-bar.ui.tsx
│   ├── follow-button.ui.tsx
│   ├── header.ui.tsx
│   ├── library-header.ui.tsx
│   ├── pagination.ui.tsx
│   ├── published-notification.ui.tsx
│   ├── search-input.ui.tsx
│   ├── sidebar.ui.tsx
│   ├── skeleton.ui.tsx
│   ├── star-rating.ui.tsx
│   ├── stats-card.ui.tsx
│   ├── tabs.ui.tsx
│   └── topbar.ui.tsx
│
├── widgets/                     # Componentes Widget (lógica)
│   ├── book-card-clickable.widget.tsx
│   ├── book-card.widget.tsx
│   ├── book-grid.widget.tsx
│   ├── category-filter-bar.widget.tsx
│   ├── dashboard-shell.widget.tsx
│   ├── favorite-book-card.widget.tsx
│   ├── favorites-book-list.widget.tsx
│   ├── library-tab-bar.widget.tsx
│   └── user-dropdown.widget.tsx
│
├── hooks/                       # Hooks customizados (compartilhados)
│   ├── use-auth-redirect.ts
│   ├── use-hydrated.ts
│   └── use-sidebar.ts
│
├── store/                       # Zustand stores
│   ├── category-cache.store.ts
│   ├── favorites.store.ts
│   ├── pagination-cache.store.ts
│   ├── search.store.ts
│   ├── sidebar.store.ts
│   └── user-books.store.ts
│
├── config/                      # Configurações
│   └── supabase.ts
│
├── lib/                         # Bibliotecas compartilhadas
│   ├── anonymous-persistence.ts
│   ├── anonymous-session.ts
│   └── permissions.ts
│
├── storage/                     # Storage adapters
│   └── use-auth-store.ts
│
└── utils/                       # Utilitários
    ├── supabase/
    │   ├── client.ts
    │   ├── middleware.ts
    │   └── server.ts
    └── cn.ts
```

---

## 5. Convenções de Nomeação

### 5.1 Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Server Action | `*.action.ts` | `books.actions.ts` |
| Componente UI | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `book-card.widget.tsx` |
| Hook | `use-*.ts` | `use-favorites.ts` |
| Store | `*.store.ts` | `favorites.store.ts` |
| Tipo | `*.types.ts` | `book.types.ts` |
| Página | `page.tsx` | `dashboard/page.tsx` |
| Layout | `layout.tsx` | `dashboard/layout.tsx` |
| Teste | `*.spec.ts[x]` | `button.ui.spec.tsx` |

### 5.2 Pastas

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Feature | `kebab-case` | `book-dashboard/` |
| Componentes | `kebab-case` | `src/shared/ui/` |
| Migrations | `NUMERO_*.sql` | `001_create_tables.sql` |

---

## 6. Padrão de Export

### 6.1 Barrel Exports (index.ts)

```tsx
// src/shared/ui/index.ts
export { Button } from "./button";
export { Avatar } from "./avatar";
export { Badge } from "./badge";
// ...
```

### 6.2 Exports em Features

```tsx
// src/features/book-dashboard/actions/index.ts
export { getBooksAction } from "./books.actions";
export { getBookByIdAction } from "./books.actions";
// ...
```

---

## 7. Padrão de Imports

### 7.1 Alias

```tsx
// Usar @ para imports absolutos
import { Button } from "@/shared/ui/button";
import { useFavorites } from "@/shared/hooks/use-favorites";
import { Book } from "@/features/book-dashboard/types/book.types";
```

### 7.2 Imports Relativos vs Absolutos

```tsx
// ✅ Absolutos para shared
import { Button } from "@/shared/ui/button";

// ✅ Relativos para dentro da mesma feature
import { Book } from "../types/book.types";

// ❌ Evitar imports longos
import { Button } from "../../../../shared/ui/button";
```

---

## 8. Arquivos de Configuração

### 8.1 TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 8.2 Next.js (next.config.ts)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

### 8.3 Tailwind (tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "...",
      },
    },
  },
};

export default config;
```

---

## 9. Boas Práticas

### 9.1 Separação por Camada

```
features/          → Lógica de negócio
shared/ui/        → Componentes visuais puros
shared/widgets/   → Componentes com lógica
shared/hooks/     → Lógica reutilizável
shared/store/     → Estado global
app/             → Rotas e composição
```

### 9.2 Feature-First

```
features/
├── auth/
│   ├── actions/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── widgets/
└── book-dashboard/
    └── ...
```

### 9.3 Shared por Domínio

```
shared/
├── ui/       → Componentes genéricos
├── hooks/    → Hooks genéricos
├── store/    → Stores genéricos
└── utils/    → Utilitários genéricos
```

---

## Acceptance Criteria

- [ ] Estrutura segue padrão feature-based
- [ ] Separação UI/Widgets/Hooks/Stores
- [ ] Convenções de nomeação respeitadas
- [ ] Imports usam alias @
- [ ] Barrel exports em index.ts
- [ ] Configurações na raiz
- [ ] Migrations em supabase/migrations
- [ ] Arquivos de teste próximos aos arquivos fonte
