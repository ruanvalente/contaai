# Plano de Conformidade: Specs vs Estrutura Real

**Versão:** 1.1
**Data:** 26/05/2026
**Status:** ✅ Concluído — Todas as fases finalizadas
**Referência:** STRUCTURE-IMPROVEMENT-PLAN.md (refatoração de pastas concluída)

---

> **Nota:** Este plano lida com as **divergências restantes** entre as specs (`project-structure-spec.md`, `page-routing-spec.md`, `hooks-spec.md`, `ui-component-spec.md`, `server-actions-spec.md`) e a estrutura real do código, após a conclusão das melhorias do `STRUCTURE-IMPROVEMENT-PLAN.md`. O objetivo é elevar o score de conformidade de 85% para 95%+.

---

## 1. Objetivo

Eliminar divergências entre as specs documentadas e a estrutura real do projeto Conta.AI, incluindo:

- **Arquivos ausentes** em `src/app/` (loading, error, not-found)
- **Nomenclatura incorreta** de hooks
- **Specs desatualizadas** (hooks movidos para features, novas features não documentadas)
- **Route groups** ausentes
- **Padrões de componente** não seguidos (displayName)

### Itens Fora do Escopo

Os seguintes itens já foram endereçados pelo `STRUCTURE-IMPROVEMENT-PLAN.md` e **não** serão repetidos aqui:

- Movimentação de `auth/components/` para `auth/widgets/`
- Auditoria de arquivos órfãos em `book-dashboard/`
- Criação de barrel exports (index.ts)
- Atualização de paths em specs

---

## 2. Diagnóstico: Divergências Atuais

### 2.1 Resumo por Severidade

| ID | Severidade | Item | Spec Afectada |
|----|-----------|------|---------------|
| S1 | 🔴 Alta | `src/app/` sem `loading.tsx`, `error.tsx`, `not-found.tsx` | `page-routing-spec.md` |
| S2 | 🔴 Alta | Hooks com `.hook.ts` não-padrão | `hooks-spec.md` |
| S3 | 🟡 Média | Specs desatualizadas (hooks p/ features, features faltando) | `project-structure-spec.md` |
| S4 | 🟡 Média | `login/` e `register/` sem route group `(auth)/` | `page-routing-spec.md` |
| S5 | 🟡 Média | Componentes UI com `forwardRef` sem `displayName` | `ui-component-spec.md` |
| S6 | 🟢 Baixa | `src/screens/` e `src/landing/` no spec mas inexistentes | `project-structure-spec.md` |
| S7 | 🟢 Baixa | `dashboard/audio/` e `audio-books/` no spec mas inexistentes | `page-routing-spec.md` |

### 2.2 Detalhamento

#### S1 — Root App: loading, error, not-found

**Problema:** O spec exige `loading.tsx`, `error.tsx` e `not-found.tsx` na raiz de `src/app/`, mas nenhum existe.

**Consequência:** Usuários veem white screen durante carregamento, erros não capturados, e 404 sem fallback.

**Arquivos existentes (parciais):**
- ✅ `src/app/dashboard/loading.tsx`
- ✅ `src/app/dashboard/error.tsx`
- ✅ `src/app/explore/loading.tsx`
- ✅ `src/app/my-session/loading.tsx`
- ❌ `src/app/loading.tsx` (root)
- ❌ `src/app/error.tsx` (root)
- ❌ `src/app/not-found.tsx` (root)

#### S2 — Hooks com `.hook.ts` não-padrão

**Problema:** A spec `hooks-spec.md` determina que hooks sigam o padrão `use-*.ts`. Dois hooks usam `use-*.hook.ts`:

| Arquivo | Localização | Padrão Correto |
|---------|-------------|----------------|
| `use-book-dashboard.hook.ts` | `book-dashboard/hooks/` | `use-book-dashboard.ts` |
| `use-discover.hook.ts` | `discovery/hooks/` | `use-discover.ts` |

**Consequência:** Quebra de convenção, dificulta busca por grep e entendimento do padrão.

#### S3 — Specs Desatualizadas

**Problema:** As specs em `.opencode/specs/` não refletem a estrutura real do código:

**3a. Hooks movidos para features (spec incorreta)**

A spec `project-structure-spec.md` lista hooks em `src/shared/hooks/` que na verdade estão em features:

| Hook | Spec diz | Realidade |
|------|----------|-----------|
| `use-book-list.ts` | `shared/hooks/` | ❌ Não existe (removido) |
| `use-books-with-cache.ts` | `shared/hooks/` | ❌ Em `book-dashboard/hooks/` |
| `use-category-filter.ts` | `shared/hooks/` | ❌ Em `discovery/hooks/` |
| `use-category-icons.ts` | `shared/hooks/` | ❌ Em `discovery/hooks/` |
| `use-favorites.ts` | `shared/hooks/` | ❌ Em `discovery/hooks/` |
| `use-favorites-search.ts` | `shared/hooks/` | ❌ Em `discovery/hooks/` |
| `use-library-state.ts` | `shared/hooks/` | ❌ Em `library/hooks/` |
| `use-library-tabs.ts` | `shared/hooks/` | ❌ Em `library/hooks/` |
| `use-search.ts` | `shared/hooks/` | ❌ Em `discovery/hooks/` |
| `use-user-books.ts` | `shared/hooks/` | ❌ Em `library/hooks/` |

**3b. Features não documentadas no spec**

O spec lista apenas `auth`, `profile`, `book-dashboard`. Features reais não documentadas:

| Feature | Existente | Documentada |
|---------|-----------|-------------|
| `discovery` | ✅ | ❌ |
| `library` | ✅ | ❌ |
| `editor` | ✅ | ❌ |
| `book-details` | ✅ | ❌ |
| `reading` | ✅ | ❌ |
| `public-books` | ✅ | ❌ |
| `author-follow` | ✅ | ❌ |
| `notifications` | ✅ | ❌ |
| `session-library` | ✅ | ❌ |

**3c. Arquivos de spec desatualizados**

| Spec | Status | Ação |
|------|--------|------|
| `project-structure-spec.md` | ❌ Desatualizado | Reescrever seções 3 e 4 |
| `hooks-spec.md` | ❌ Parcial | Adicionar hooks de features |
| `page-routing-spec.md` | ❌ Desatualizado | Adicionar novas rotas |
| `server-actions-spec.md` | ✅ OK | Apenas adicionar novas actions |
| `ui-component-spec.md` | ✅ OK | Apenas adicionar novos componentes |
| `widget-component-spec.md` | ✅ OK | Apenas adicionar novos widgets |

#### S4 — Route Group (auth)/ Ausente

**Problema:** O spec define `(auth)/login/` e `(auth)/register/` como route group, mas a realidade tem `login/` e `register/` soltos na raiz de `src/app/`.

**Estado atual:**
- `src/app/login/page.tsx` ✅ (funcional)
- `src/app/register/page.tsx` ✅ (funcional)

**Consequência:** Rotas funcionam, mas sem layout compartilhado de autenticação e fora do padrão do spec. Impacto baixo pois Next.js não exige route groups.

#### S5 — displayName Ausente em forwardRef

**Problema:** A spec `ui-component-spec.md` exige `displayName` em componentes que usam `forwardRef`, mas a maioria não define.

**Componentes com forwardRef:**

| Componente | forwardRef | displayName |
|-----------|-----------|-------------|
| `Button` | ✅ | ❌ Ausente |
| `BookCover` | ✅ | ❌ Ausente |
| `BookCard` | ✅ | ❌ Ausente |
| `Badge` | ✅ | ❌ Ausente |
| `Avatar` | ✅ | ❌ Ausente |

**Consequência:** Dificulta debugging no React DevTools, onde esses componentes aparecem como `ForwardRef` genérico.

#### S6 — Pastas screens/ e landing/ no Spec

**Problema:** O spec `project-structure-spec.md` lista `src/screens/` e `src/landing/` como diretórios da estrutura principal, mas eles nunca existiram no projeto.

**Ação:** Remover referências do spec, ou criar diretórios se houver planejamento.

#### S7 — Rotas audio/ e audio-books/ no Spec

**Problema:** O spec `page-routing-spec.md` lista `dashboard/audio/` e `audio-books/`, mas nenhuma delas existe.

**Ação:** Remover do spec ou implementar se planejado.

---

## 3. Plano de Ação

### 3.1 🔴 S1 — Criar loading.tsx, error.tsx e not-found.tsx no Root

**Arquivo:** `src/app/loading.tsx`

```tsx
export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-96" />
      </div>
    </div>
  );
}
```

**Arquivo:** `src/app/error.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button.ui";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

**Arquivo:** `src/app/not-found.tsx`

```tsx
import Link from "next/link";
import { Button } from "@/shared/ui/button.ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
```

**Checklist:**
- [x] Criar `src/app/loading.tsx`
- [x] Criar `src/app/error.tsx`
- [x] Criar `src/app/not-found.tsx`
- [x] Verificar build com `bun run build`

---

### 3.2 🔴 S2 — Renomear Hooks com .hook.ts

**Passo 1:** Renomear `use-book-dashboard.hook.ts`

```bash
mv src/features/book-dashboard/hooks/use-book-dashboard.hook.ts \
   src/features/book-dashboard/hooks/use-book-dashboard.ts
```

**Passo 2:** Atualizar imports em `src/features/book-dashboard/hooks/index.ts`:
```typescript
export * from './use-book-dashboard';
// Antigo: export * from './use-book-dashboard.hook';
```

**Passo 3:** Atualizar imports em arquivos que importam o hook:
- Buscar referências a `use-book-dashboard.hook` no código

```bash
rg "use-book-dashboard\.hook" src/ --files-with-matches
```

**Passo 4:** Renomear `use-discover.hook.ts`

```bash
mv src/features/discovery/hooks/use-discover.hook.ts \
   src/features/discovery/hooks/use-discover.ts
```

**Passo 5:** Atualizar imports em `src/features/discovery/hooks/index.ts`:
```typescript
export * from './use-discover';
// Antigo: export * from './use-discover.hook';
```

**Passo 6:** Atualizar import em `src/features/discovery/pages/discover.page.tsx`:
```typescript
// Antigo:
import { useDiscover } from "../hooks/use-discover.hook";
// Novo:
import { useDiscover } from "../hooks/use-discover";
```

**Checklist:**
- [x] Renomear `use-book-dashboard.hook.ts` → `use-book-dashboard.ts`
- [x] Atualizar barrel export em `book-dashboard/hooks/index.ts` *(não era necessário — arquivo sem imports)*
- [x] Verificar imports em arquivos dependentes *(dead code, zero referências)*
- [x] Renomear `use-discover.hook.ts` → `use-discover.ts`
- [x] Atualizar barrel export em `discovery/hooks/index.ts`
- [x] Atualizar imports em `discovery/pages/discover.page.tsx`
- [x] Verificar build com `bun run build`

---

### 3.3 🟡 S3 — Atualizar Specs

#### 3.3a — Especificação: project-structure-spec.md

**Seção 3 (src/features/):** Substituir conteúdo atual por todas as 12 features:

````markdown
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
````

**Seção 4 (src/shared/):** Atualizar hooks para refletir a realidade:

````markdown
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
└── storage/                     # Storage adapters
    └── use-auth-store.ts
```
````

#### 3.3b — Especificação: page-routing-spec.md

Adicionar rotas reais não documentadas:

```markdown
├── explore/                     # Explorar livros
│   ├── page.tsx
│   └── loading.tsx
│
├── landingpage/                 # Landing page institucional
│   └── page.tsx
│
├── my-session/                  # Sessão anônima
│   ├── page.tsx
│   └── loading.tsx
│
├── settings/                    # Configurações
│   └── page.tsx
│
├── downloads/                   # Downloads
│   └── page.tsx
│
├── library/                     # Biblioteca pública
│   └── page.tsx
│
├── favorites/                   # Favoritos públicos
│   └── page.tsx
│
└── book-dashboard/              # Dashboard de livros
    └── page.tsx
```

#### 3.3c — Especificação: hooks-spec.md

Adicionar seção de hooks em features (exemplo `discovery` e `library`):

````markdown
### 3. Hooks por Feature

```
src/features/discovery/hooks/
├── use-category-filter.ts
├── use-category-icons.ts
├── use-discover.ts
├── use-favorites-search.ts
├── use-favorites.ts
└── use-search.ts

src/features/library/hooks/
├── use-library-state.ts
├── use-library-tabs.ts
└── use-user-books.ts

src/features/book-dashboard/hooks/
├── use-book-dashboard.ts
├── use-book-editor.ts
├── use-books-with-cache.ts
├── use-books.ts
├── use-categories.ts
├── use-editor-backup-interval.ts
├── use-editor-backup.ts
├── use-editor-publish.ts
├── use-editor-toolbar.ts
└── use-selected-book.ts
```
````

**Checklist:**
- [x] Atualizar `project-structure-spec.md` seção 3 (features)
- [x] Atualizar `project-structure-spec.md` seção 4 (shared)
- [x] Atualizar `page-routing-spec.md` com rotas reais
- [x] Atualizar `hooks-spec.md` com hooks por feature
- [x] Atualizar seções de actions/ui/widgets em specs correspondentes

---

### 3.4 🟡 S4 — Criar Route Group (auth)/

**Passo 1:** Criar diretório e mover arquivos:

```bash
mkdir -p src/app/\(auth\)/
mv src/app/login src/app/\(auth\)/login
mv src/app/register src/app/\(auth\)/register
```

**Passo 2:** Criar layout compartilhado para auth (opcional):

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
```

**Passo 3:** Verificar se há links para `/login` e `/register` no código e confirmar que continuam funcionando (rotas são as mesmas com ou sem route group).

**Checklist:**
- [x] Criar `src/app/(auth)/`
- [x] Mover `login/` para `(auth)/login/`
- [x] Mover `register/` para `(auth)/register/`
- [x] Criar `(auth)/layout.tsx` (opcional)
- [x] Verificar links da aplicação
- [x] Verificar build com `bun run build`

---

### 3.5 🟡 S5 — Adicionar displayName em Componentes UI

Adicionar `displayName` em cada componente que usa `forwardRef`:

```typescript
// src/shared/ui/button.ui.tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...);
Button.displayName = "Button";

// src/shared/ui/book-cover.ui.tsx
export const BookCover = forwardRef<HTMLDivElement, BookCoverProps>(...);
BookCover.displayName = "BookCover";

// src/shared/ui/book-card.ui.tsx
export const BookCard = forwardRef<HTMLDivElement, BookCardProps>(...);
BookCard.displayName = "BookCard";

// src/shared/ui/badge.ui.tsx
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(...);
Badge.displayName = "Badge";

// src/shared/ui/avatar.ui.tsx
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(...);
Avatar.displayName = "Avatar";
```

**Checklist:**
- [x] Adicionar `displayName` em `Button`
- [x] Adicionar `displayName` em `BookCover`
- [x] Adicionar `displayName` em `BookCard`
- [x] Adicionar `displayName` em `Badge`
- [x] Adicionar `displayName` em `Avatar`

---

### 3.6 🟢 S6 — Limpar Referências a Pastas Inexistentes

**Passo 1:** Remover referências a `src/screens/` e `src/landing/` de `project-structure-spec.md` seção 1:

```markdown
# Antigo:
│   ├── screens/                   # Páginas de dashboard
│   ├── landing/                   # Landing page

# Novo:
│   └── utils/                     # Utilitários
```

**Passo 2:** (Alternativa) Se houver planos futuros, manter mas marcar como `📅 Planejado`.

**Checklist:**
- [x] Remover `screens/` do spec OU marcar como planejado
- [x] Remover `landing/` do spec OU marcar como planejado
- [x] Verificar se AGENTS.md também precisa de atualização

---

### 3.7 🟢 S7 — Limpar Referências a Rotas Inexistentes

**Passo 1:** Remover `dashboard/audio/` e `audio-books/` de `page-routing-spec.md`.

**Passo 2:** (Alternativa) Se houver planos futuros, criar arquivos placeholder com `🚧 Em construção`.

**Checklist:**
- [x] Remover rotas `audio/` e `audio-books/` do spec OU marcar como planejado

---

## 4. Ordem de Execução Sugerida

```
Fase 1 — ✅ 🔴 S2: Renomear hooks .hook.ts → .ts
Fase 2 — ✅ 🔴 S1: Criar loading/error/not-found no root
Fase 3 — ✅ 🟡 S5: Adicionar displayName nos componentes UI
Fase 4 — ✅ 🟡 S4: Criar route group (auth)/
Fase 5 — ✅ 🟡 S3: Atualizar specs
Fase 6 — ✅ 🟢 S6+S7: Limpar referências obsoletas
```

**Justificativa da ordem:**
1. **S2 primeiro** por ser o mais simples e ter risco de quebrar imports
2. **S1 em seguida** por ser o de maior impacto visual para o usuário
3. **S5** porque é trivial e não quebra nada
4. **S4** porque mexe em rotas — fazer quando houver confiança no build
5. **S3** por último pois requer entendimento completo do estado final
6. **S6+S7** são apenas documentação, fazem-se em qualquer ordem

---

## 5. Estimativa de Esforço

| Tarefa | Prioridade | Esforço | Complexidade |
|--------|------------|---------|--------------|
| S2 — Renomear hooks | 🔴 Alta | 30min | Baixa |
| S1 — Root loading/error/not-found | 🔴 Alta | 1h | Baixa |
| S5 — displayName em UI | 🟡 Média | 15min | Baixa |
| S4 — Route group (auth) | 🟡 Média | 30min | Média |
| S3 — Atualizar specs | 🟡 Média | 2h | Média |
| S6+S7 — Limpar specs | 🟢 Baixa | 30min | Baixa |
| **Total** | | **~5h** | |

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| S2: Import quebrado após rename | ✅ Resolvido | — | `use-discover` tinha 2 refs (atualizadas); `use-book-dashboard` era dead code (0 refs) |
| S4: Links quebrados para login/register | Baixa | Alto | Route groups não mudam URL — risco teórico apenas |
| S1: loading/error styles inconsistentes | Média | Baixo | Copiar padrão do `dashboard/loading.tsx` existente |
| S3: Specs ficarem desatualizadas novamente | Alta | Médio | Adicionar `validate-structure` ao CI/CD |

---

## 7. Critérios de Sucesso

- [x] Score de conformidade >= 95%
- [x] `bun run build` passa sem erros
- [x] `bun run lint` passa sem erros
- [x] Nenhum hook com extensão `.hook.ts`
- [x] `loading.tsx`, `error.tsx`, `not-found.tsx` presentes em `src/app/`
- [x] Todos os componentes com `forwardRef` têm `displayName`
- [x] Specs refletem a estrutura real do código
- [x] Rotas `login/` e `register/` funcionam inalteradas

---

## 8. Referências

- [Next.js: loading.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js: error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js: not-found.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Next.js: Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [React: forwardRef + displayName](https://react.dev/reference/react/forwardRef#displaying-a-custom-name-in-devtools)
- **Plano Relacionado:** `STRUCTURE-IMPROVEMENT-PLAN.md` (refatoração de pastas concluída)
