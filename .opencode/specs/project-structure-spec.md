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
│   ├── screens/                   # Páginas de dashboard
│   ├── landing/                   # Landing page
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
├── globals.css                    # Estilos globais
│
├── (auth)/                       # Grupo de autenticação
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── dashboard/                    # Área autenticada
│   ├── page.tsx
│   ├── layout.tsx
│   ├── library/
│   ├── favorites/
│   ├── downloads/
│   ├── settings/
│   ├── audio/
│   ├── category/
│   └── editor/
│       └── [id]/
│
├── book/
│   └── [id]/
│
├── library/                      # Biblioteca pública
├── category/
├── favorites/
├── downloads/
├── audio-books/
├── landingpage/
└── api/                         # API routes
    └── [endpoint]/
```

---

## 3. Estrutura src/features

```
src/features/
├── auth/                         # Autenticação
│   ├── actions/
│   │   └── auth.actions.ts
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── widgets/
│
├── profile/                      # Perfil do usuário
│   ├── actions/
│   │   ├── get-profile.action.ts
│   │   ├── update-profile.action.ts
│   │   ├── upload-avatar.action.ts
│   │   └── upload.actions.ts
│   ├── components/
│   ├── hooks/
│   ├── types/
│   │   └── profile.types.ts
│   ├── widgets/
│   │   ├── avatar-upload.widget.tsx
│   │   └── profile-form.widget.tsx
│   └── store/
│
└── book-dashboard/              # Dashboard de livros
    ├── actions/
    │   ├── books.actions.ts
    │   ├── user-books.actions.ts
    │   ├── user-favorites.actions.ts
    │   └── upload-book-cover.action.ts
    ├── components/
    ├── data/
    ├── hooks/
    │   ├── use-books.ts
    │   ├── use-categories.ts
    │   ├── use-selected-book.ts
    │   └── use-book-dashboard.hook.ts
    ├── pages/
    │   └── book-dashboard.page.tsx
    ├── store/
    │   └── book-editor.store.ts
    ├── types/
    │   ├── book.types.ts
    │   └── user-book.types.ts
    ├── ui/
    ├── widgets/
    │   ├── book-card.widget.tsx
    │   ├── book-editor.widget.tsx
    │   ├── book-details-modal.widget.tsx
    │   ├── categories-section.widget.tsx
    │   ├── create-book-modal.widget.tsx
    │   ├── downloads-content.widget.tsx
    │   ├── favorites-content.widget.tsx
    │   ├── library-content.widget.tsx
    │   ├── recommended-section.widget.tsx
    │   └── search-results.widget.tsx
    └── specs/
        └── use-case.spec.md
```

---

## 4. Estrutura src/shared

```
src/shared/
├── ui/                          # Componentes UI (puros)
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── book-card.tsx
│   ├── book-cover.tsx
│   ├── button.tsx
│   ├── category-header.ui.tsx
│   ├── container.tsx
│   ├── empty-favorites-state.ui.tsx
│   ├── empty-library-state.ui.tsx
│   ├── favorite-button.ui.tsx
│   ├── favorites-header.ui.tsx
│   ├── favorites-search-bar.ui.tsx
│   ├── header.ui.tsx
│   ├── library-header.ui.tsx
│   ├── pagination.ui.tsx
│   ├── published-notification.ui.tsx
│   ├── search-input.tsx
│   ├── sidebar.tsx
│   ├── skeleton.ui.tsx
│   ├── stats-card.tsx
│   ├── tabs.tsx
│   └── topbar.tsx
│
├── widgets/                     # Componentes Widget (lógica)
│   ├── book-grid.widget.tsx
│   ├── category-filter-bar.widget.tsx
│   ├── dashboard-shell.widget.tsx
│   ├── favorite-book-card.widget.tsx
│   ├── favorites-book-list.widget.tsx
│   ├── library-tab-bar.widget.tsx
│   └── user-dropdown.widget.tsx
│
├── hooks/                       # Hooks customizados
│   ├── use-book-list.ts
│   ├── use-books-with-cache.ts
│   ├── use-category-filter.ts
│   ├── use-category-icons.ts
│   ├── use-favorites.ts
│   ├── use-favorites-search.ts
│   ├── use-hydrated.ts
│   ├── use-library-state.ts
│   ├── use-library-tabs.ts
│   ├── use-search.ts
│   ├── use-sidebar.ts
│   └── use-user-books.ts
│
├── store/                       # Zustand stores
│   ├── category-cache.store.ts
│   ├── favorites.store.ts
│   ├── pagination-cache.store.ts
│   ├── search.store.ts
│   └── sidebar.store.ts
│
├── config/                      # Configurações
│   ├── providers.tsx
│   ├── supabase.ts
│   └── theme.ts
│
├── storage/                     # Storage adapters
│   └── use-auth-store.ts
│
└── utils/                       # Utilitários
    ├── supabase/
    │   ├── client.ts
    │   ├── middleware.ts
    │   └── server.ts
    ├── cn.ts
    └── ...
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
