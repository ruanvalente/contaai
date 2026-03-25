# AGENTS.md — Conta.AI

## 1. Visão Geral do Projeto

**Conta.AI** é uma aplicação web para gerenciamento de livros e biblioteca digital, com funcionalidades de autenticação, descoberta de livros, perfil de usuário e sistema de favoritos/downloads.

### Stack Utilizada

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16.2.0 (App Router) |
| Linguagem | TypeScript |
| UI | React 19.2.4, Tailwind CSS 4 |
| Estado | Zustand |
| Banco | Supabase (PostgreSQL + Auth) |
| Package Manager | Bun |
| Animações | Framer Motion |
| Editor | Lexical |

---

## 2. Arquitetura

### Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router (rotas)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Área autenticada
│   ├── login/             # Login
│   ├── register/          # Cadastro
│   └── ...
├── features/              # Domínio da aplicação
│   ├── auth/              # Autenticação
│   ├── profile/           # Perfil do usuário
│   ├── discovery/         # Descoberta de livros
│   └── book-dashboard/    # Dashboard de livros
├── shared/                # Componentes reutilizáveis
│   ├── ui/                # Componentes visuais (puros)
│   ├── widgets/           # Componentes com lógica
│   ├── hooks/             # Hooks customizados
│   ├── store/             # Zustand stores
│   ├── config/            # Configurações
│   └── utils/             # Utilitários
├── landing/               # Landing page
└── screens/               # Páginas de dashboard
supabase/
├── migrations/            # Migrações do banco
└── ...
```

### Padrões Arquiteturais

- **Feature-based**: Cada domínio possui sua própria pasta em `features/`
- **Server Actions**: Lógica de servidor em `features/*/actions/`
- **Separação UI/Widgets**:
  - `ui/` → Componentes visuais puros (sem lógica de negócio)
  - `widgets/` → Componentes com lógica (estado, handlers)
- **Client/Server Components**: Next.js App Router conventions
- **Zustand**: Estado global client-side

---

## 3. Convenções de Código

### Nomeação de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente UI | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `user-dropdown.widget.tsx` |
| Page | `page.tsx` ou `*.page.tsx` | `settings.page.tsx` |
| Hook | `use-*.ts` | `use-sidebar.ts` |
| Store | `*.store.ts` | `sidebar.store.ts` |
| Action | `*.action.ts` | `get-profile.action.ts` |

### Separação de Responsabilidades

```
src/shared/ui/           → Componentes visuais (Button, Avatar, Card)
src/shared/widgets/      → Componentes com estado (UserDropdown)
src/features/*/actions/  → Server Actions (mutações, queries)
src/features/*/ui/      → Componentes específicos do domínio
src/features/*/widgets/  → Widgets específicos do domínio
```

### Boas Práticas

1. **Server Components** por padrão; usar `'use client'` apenas quando necessário
2. **Server Actions** para mutações de dados
3. **Zustand** para estado global client-side
4. **Tailwind CSS** para estilização (v4)
5. **TypeScript** estrito

---

## 4. Uso das Skills

### 4.1 Vercel React Best Practices

**Localização:** `.agents/skills/vercel-react-best-practices/`

**Objetivo:** Otimização de performance para React e Next.js

**Quando usar:**
- Escrever novos componentes React
- Implementar data fetching (client/server)
- Revisar código para problemas de performance
- Refatorar código existente
- Otimizar bundle size

**Regras Prioritárias:**

| Prioridade | Categoria | Quando Aplicar |
|------------|-----------|----------------|
| CRITICAL | Eliminating Waterfalls | Queries paralelas com Promise.all |
| CRITICAL | Bundle Size | Dynamic imports, evitar barrel files |
| HIGH | Server-Side Performance | React.cache(), after() |
| MEDIUM | Re-render Optimization | memo(), useMemo() |

**Exemplo no projeto:**

```typescript
// ✅ Server Action otimizada (async-parallel)
async function getDashboardData() {
  const userPromise = getCurrentUser()
  const booksPromise = getBooks()
  
  const [user, books] = await Promise.all([
    userPromise,
    booksPromise
  ])
  
  return { user, books }
}

// ✅ Dynamic import para componente pesado (bundle-dynamic-imports)
const BookDetailsModal = dynamic(
  () => import('./book-details-modal.widget'),
  { ssr: false }
)
```

---

### 4.2 Frontend Design

**Localização:** `.agents/skills/frontend-design/`

**Objetivo:** Criar interfaces distintas e production-grade, evitando "AI slop"

**Quando usar:**
- Criar novos componentes UI
- Definir identidade visual
- Escolher tipografia e cores
- Implementar animações

**Diretrizes:**

1. **Tipografia:** Escolher fontes distintas e interessantes (evitar Inter, Roboto)
2. **Cor:** Usar CSS variables, paleta coesa com cores dominantes + acentos
3. **Motion:** Animações com framer-motion, staggered reveals, scroll triggers
4. **Composição espacial:** Layouts inesperados, assimetria, overlap
5. **Backgrounds:** Criar atmosfera com texturas, gradientes, patterns

**Exemplo no projeto:**

```typescript
// ✅ Escolha de fonte distinta (em globals.css)
:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans 3', sans-serif;
}

// ✅ Cores coesas com acento
--color-primary: #1a1a2e;
--color-accent: #e94560;
```

---

### 4.3 Supabase Postgres Best Practices

**Localização:** `.agents/skills/supabase-postgres-best-practices/`

**Objetivo:** Otimização de queries PostgreSQL e segurança

**Quando usar:**
- Escrever queries SQL
- Criar migrações
- Configurar RLS (Row-Level Security)
- Otimizar performance de banco

**Regras Prioritárias:**

| Prioridade | Categoria | Quando Aplicar |
|------------|-----------|----------------|
| CRITICAL | Query Performance | Índices, query tuning |
| CRITICAL | Security & RLS | Políticas de acesso |
| HIGH | Schema Design | Estrutura de tabelas |
| MEDIUM-HIGH | Concurrency | Locking, transactions |

**Exemplo no projeto:**

```sql
-- ✅ Query otimizada com índice
CREATE INDEX idx_books_category ON books(category);

-- ✅ RLS policy
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```

---

### 4.4 Web Artifacts Builder

**Localização:** `.agents/skills/web-artifacts-builder/`

**Objetivo:** Criar artifacts React standalone para demonstração

**Quando usar:**
- Criar demos/protótipos
- Compartilhar componentes isolados
- Testar UI sem contexto do projeto

**Setup:**

```bash
# Inicializar projeto de artifact
bash scripts/init-artifact.sh <project-name>

# Desenvolver normalmente

# Bundlar para HTML único
bash scripts/bundle-artifact.sh
```

**Nota:** Esta skill é mais relevante para criar demonstrações externas, não para o desenvolvimento diário do projeto.

---

## 5. Padrões de Desenvolvimento

### Como Criar Novos Componentes

1. **UI (visual puro):** `src/shared/ui/component.ui.tsx`
2. **Widget (com lógica):** `src/shared/widgets/component.widget.tsx`
3. **Feature:** `src/features/<feature>/widgets/`

```typescript
// src/shared/ui/button.ui.tsx (UI - visual)
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={cn('btn', `btn-${variant}`)}>
      {children}
    </button>
  )
}

// src/shared/widgets/search.widget.tsx (Widget - com estado)
'use client'
export function SearchWidget() {
  const [query, setQuery] = useState('')
  // lógica...
}
```

### Como Integrar APIs

**Server Actions** (recomendado):

```typescript
// src/features/books/actions/get-books.action.ts
'use server'

import { cache } from 'react'
import { db } from '@/shared/config/db'

export const getBooks = cache(async (category?: string) => {
  return db.books.findMany({
    where: category ? { category } : undefined
  })
})
```

### Como Lidar com Estado

**Zustand (global client):**

```typescript
// src/shared/store/ui.store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  }))
}))
```

**useState (local):**

```typescript
// Para estado local de componente
const [loading, setLoading] = useState(false)
```

---

## 6. Setup e Execução

### Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev          # Iniciar servidor dev

# Build
bun run build       # Build de produção
bun run start       # Iniciar servidor de produção

# Linting
bun run lint        # Verificar código
```

### Variáveis de Ambiente

Ver `.env.example` para configurações necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Skills Instaladas

| Skill | Localização |
|-------|-------------|
| Vercel React Best Practices | `.agents/skills/vercel-react-best-practices/` |
| Frontend Design | `.agents/skills/frontend-design/` |
| Supabase Postgres Best Practices | `.agents/skills/supabase-postgres-best-practices/` |
| Web Artifacts Builder | `.agents/skills/web-artifacts-builder/` |

### Verificar Skills

```bash
npx skills list
```

---

## Referências

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
