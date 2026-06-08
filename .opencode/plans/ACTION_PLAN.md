# Plano de Ação — Melhorias da Codebase Conta.AI

> **Data de geração:** 28/05/2026  
> **Baseado em:** Análise estática da codebase completa  
> **Metodologia:** Fases priorizadas por impacto × esforço

---

## Visão Geral das Fases

| Fase | Nome                              | Esforço     | Impacto | Prazo Sugerido        |
| ---- | --------------------------------- | ----------- | ------- | --------------------- |
| 1    | Fundação de Segurança             | Baixo–Médio | Crítico | Sprint 1 (1–2 dias)   |
| 2    | Padronização de Erros e Validação | Médio       | Alto    | Sprint 1–2 (2–3 dias) |
| 3    | Performance e Bundle              | Médio       | Alto    | Sprint 2 (2–3 dias)   |
| 4    | Arquitetura e Consistência        | Alto        | Alto    | Sprint 3 (3–5 dias)   |
| 5    | Qualidade de Código e Type Safety | Médio       | Médio   | Sprint 3–4 (2–3 dias) |
| 6    | Testes                            | Alto        | Médio   | Sprint 4–5 (4–6 dias) |
| 7    | Observabilidade e Infra           | Médio       | Médio   | Sprint 5 (2–3 dias)   |

---

## Fase 0 — Correções do Plano (Alta Prioridade) ✅

> **Objetivo:** Corrigir inconsistências identificadas na análise estática antes de iniciar a implementação.
> **Status:** ✅ Concluído nesta seção

### 0.1 Zod já está instalado (v4.3.6)

**Correção:** Instrução `bun add zod` removida de todas as fases. Zod v4.3.6 já é dependência do projeto.

**Arquivos afetados:**
- `package.json` — já contém `"zod": "^4.3.6"`
- Fase 1.1 — instrução de instalação removida
- Fase 2.2 — instrução de instalação removida

---

### 0.2 Consolidar Clients Supabase (5 padrões, não 2)

**Correção:** Documentação da Fase 1.4 atualizada para refletir todos os 5 padrões de criação de client Supabase. Caminhos de import corrigidos para usar os paths reais do projeto.

**Detalhamento dos 5 padrões encontrados:**

| # | Arquivo | Tipo | Ação |
|---|---------|------|------|
| 1 | `src/shared/config/supabase.ts` | Client básico (`@supabase/supabase-js`) | Remover |
| 2 | `src/utils/supabase/client.ts` | Browser SSR (`@supabase/ssr`) | Manter |
| 3 | `src/utils/supabase/server.ts` | Server SSR (`@supabase/ssr`) | Manter e refatorar |
| 4 | `src/utils/supabase/middleware.ts` | Middleware SSR (`@supabase/ssr`) | Manter |
| 5 | `src/lib/supabase/get-supabase-admin.ts` | Admin (`@supabase/ssr` + service key) | Renomear |

---

### 0.3 Formato do ESLint Config Corrigido

**Correção:** Código de exemplo da Fase 5.3 atualizado para usar flat config (`defineConfig` + array) em vez do formato legacy.

---

## Fase 1 — Fundação de Segurança

> **Objetivo:** Corrigir vulnerabilidades críticas antes de qualquer outra mudança.

### 1.2 Ocultar Mensagens de Erro Internas do Cliente

**Problema:** Actions em `src/features/*/actions/` retornam ou propagam mensagens de erro do Supabase/DB diretamente ao cliente, expondo estrutura interna.

**Solução:**

Criar `src/shared/lib/action-error.ts`:

```typescript
export class ActionError extends Error {
  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    cause?: unknown,
  ) {
    super(userMessage, { cause });
    this.name = "ActionError";
  }
}

export function toUserError(error: unknown): string {
  if (error instanceof ActionError) return error.userMessage;
  // Log apenas server-side (não expõe ao cliente)
  console.error("[ServerAction Error]", error);
  return "Ocorreu um erro inesperado. Tente novamente.";
}
```

Aplicar padrão em todas as actions:

```typescript
// ❌ Antes
if (error) return { error: error.message };

// ✅ Depois
if (error) {
  console.error("[getBooks] DB error:", error); // server-side apenas
  return { error: "Não foi possível carregar os livros." };
}
```

**Arquivos a atualizar:**

- `src/features/discovery/actions/books.actions.ts`
- `src/features/auth/actions/auth.actions.ts`
- `src/features/library/actions/*`
- `src/features/profile/actions/*`

**Critério de conclusão:** Nenhuma mensagem de erro de DB/Supabase chega ao cliente.

---

### 1.3 Melhorar o Proxy (Middleware) de Autenticação Existente

**Contexto:** O projeto já possui middleware de autenticação em `src/proxy.ts`. No Next.js 16+, o arquivo de middleware passou a se chamar `proxy.ts` em vez de `middleware.ts`. O arquivo já implementa proteção de rotas com Supabase SSR.

**Problemas identificados no `proxy.ts` atual:**

1. **Usa `getSession()` em vez de `getUser()`** — `getSession()` lê apenas o cookie local sem revalidar com o servidor, permitindo tokens expirados passarem pela guarda. `getUser()` faz validação real junto ao Supabase Auth.
2. **Redireciona usuários autenticados tentando acessar `/login` ou `/register`** — atualmente não há esse tratamento, o usuário autenticado pode acessar as páginas de auth.
3. **Env vars acessadas sem validação** — retorna `NextResponse.next()` silenciosamente se as vars estiverem ausentes, em vez de falhar de forma explícita.
4. **`/my-session` está na lista de rotas públicas** mas deveria ser protegida (é uma área da sessão do usuário).

**Solução — atualizar `src/proxy.ts`:**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/explore",
  "/landingpage",
  "/login",
  "/register",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/api/health",
  "/book/",
];

const AUTH_ONLY_PATHS = ["/login", "/register"]; // redirecionar se já autenticado

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path),
    ) || pathname.startsWith("/auth/");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Falha explícita em vez de permitir acesso sem configuração
  if (!supabaseUrl || !supabaseKey) {
    console.error("[proxy] Variáveis de ambiente do Supabase ausentes.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // ✅ getUser() valida o token junto ao servidor (mais seguro que getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rota protegida sem sessão → redirecionar para login
  if (!isPublicPath && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Usuário autenticado tentando acessar login/register → redirecionar para dashboard
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isAuthOnlyPath && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Critério de conclusão:**

- Sem uso de `getSession()` no proxy — apenas `getUser()`
- Usuário autenticado redirecionado ao tentar acessar `/login` ou `/register`
- Ausência de env vars causa redirecionamento explícito, não acesso liberado
- `/my-session` removida da lista de rotas públicas

---

### 1.4 Consolidar Criação do Client Supabase

**Problema:** Cinco padrões de criação de client Supabase coexistem, criando fragmentação:

1. `src/utils/supabase/server.ts` — server SSR client (correto para Server Components/Actions)
2. `src/utils/supabase/client.ts` — browser SSR client (correto para Client Components)
3. `src/utils/supabase/middleware.ts` — middleware client (usado pelo proxy)
4. `src/lib/supabase/get-supabase-admin.ts` — admin client com service role key
5. `src/shared/config/supabase.ts` — client básico sem SSR (NÃO deve ser usado)

**Solução:**

Consolidar em dois pontos únicos — server (`src/utils/supabase/server.ts`) e admin (`src/lib/supabase/admin-client.ts`):

```typescript
// src/utils/supabase/server.ts — já existe, refatorar para usar env.ts (Fase 1.1)
import { env } from "@/shared/config/env";

export async function getSupabaseServerClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    },
  );
}

// src/lib/supabase/admin-client.ts — SOMENTE para operações administrativas
// ⚠️ NUNCA importar em componentes client ou rotas públicas
import { createClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

let _adminClient: ReturnType<typeof createClient> | null = null;
export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _adminClient;
}
```

**Deprecar:**
- `src/shared/config/supabase.ts` — substituído pelos clients SSR em `utils/supabase/`
- `src/lib/supabase/get-supabase-admin.ts` — substituído por `admin-client.ts`

**Manter (já no padrão correto):**
- `src/utils/supabase/client.ts`
- `src/utils/supabase/middleware.ts`

**Critério de conclusão:** Um único ponto de criação por tipo de client; zero imports de `src/shared/config/supabase.ts`.

---

## Fase 2 — Padronização de Erros e Validação

> **Objetivo:** Criar contratos explícitos entre server e client, eliminando comportamentos inconsistentes.

### 2.1 Tipo Padrão para Retorno de Actions

**Problema:** Algumas actions retornam `{ success: boolean; error?: string }`, outras `throw`, outras `null` ou `undefined`.

**Solução:**

Criar `src/shared/types/action-result.ts`:

```typescript
export type ActionSuccess<T = void> = {
  ok: true;
  data: T;
};

export type ActionFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

// Helpers
export const success = <T>(data: T): ActionSuccess<T> => ({ ok: true, data });
export const failure = (code: string, message: string): ActionFailure => ({
  ok: false,
  error: { code, message },
});
```

Refatorar actions existentes:

```typescript
// ❌ Antes
export async function updateProfile(data: ProfileData) {
  const { error } = await supabase.from("profiles").update(data);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ✅ Depois
export async function updateProfile(data: ProfileData): Promise<ActionResult> {
  const { error } = await supabase.from("profiles").update(data);
  if (error) {
    console.error("[updateProfile]", error);
    return failure(
      "UPDATE_PROFILE_FAILED",
      "Não foi possível atualizar o perfil.",
    );
  }
  return success(undefined);
}
```

**Critério de conclusão:** Todas as server actions retornam `ActionResult<T>`.

---

### 2.2 Validação de Inputs com Zod em Todas as Actions

**Problema:** Parâmetros de actions chegam sem validação runtime, permitindo inputs maliciosos ou malformados.

**Solução:**

> Zod já está instalado (v4.3.6). Verificar com `bun pm ls | grep zod`.

Criar schemas por feature:

```typescript
// src/features/discovery/schemas/books.schema.ts
import { z } from "zod";
import { BOOK_CATEGORIES } from "@/shared/config/constants";

export const getBooksSchema = z.object({
  category: z.enum(BOOK_CATEGORIES as [string, ...string[]]).optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  category: z.enum(BOOK_CATEGORIES as [string, ...string[]]),
  coverUrl: z.string().url().optional(),
});
```

Aplicar nas actions:

```typescript
export async function getBooks(input: unknown) {
  const parsed = getBooksSchema.safeParse(input);
  if (!parsed.success) {
    return failure("INVALID_INPUT", "Parâmetros inválidos.");
  }
  const { category, search, page, limit } = parsed.data;
  // ...
}
```

**Arquivos a criar:**

- `src/features/discovery/schemas/books.schema.ts`
- `src/features/library/schemas/book.schema.ts`
- `src/features/profile/schemas/profile.schema.ts`
- `src/features/auth/schemas/auth.schema.ts`

**Critério de conclusão:** Nenhuma action aceita `unknown` sem validação prévia.

---

### 2.3 Error Boundaries nos Widgets Críticos

**Problema:** Erros assíncronos em widgets como `user-dropdown.widget.tsx` podem derrubar toda a UI sem feedback.

**Solução:**

Criar `src/shared/ui/error-boundary.ui.tsx`:

```typescript
"use client";
import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
```

Aplicar nos widgets críticos em `src/app/dashboard/layout.tsx` e similares:

```tsx
<ErrorBoundary fallback={<p>Erro ao carregar. Recarregue a página.</p>}>
  <UserDropdownWidget />
</ErrorBoundary>
```

**Critério de conclusão:** Erros em widgets isolados não afetam o resto da página.

---

## Fase 3 — Performance e Bundle

> **Objetivo:** Reduzir tempo de carregamento inicial e re-renders desnecessários.

### 3.1 Implementar `React.cache()` para Queries de Servidor

**Problema:** Funções como `getCategories()` e dados de profile podem ser chamadas múltiplas vezes no mesmo request sem deduplicação.

**Solução:**

```typescript
// src/features/discovery/data/books.data.ts
import { cache } from "react";

export const getCategories = cache(async () => {
  const supabase = await getServerClient();
  const { data } = await supabase.from("categories").select("*");
  return data ?? [];
});

export const getBookById = cache(async (id: string) => {
  const supabase = await getServerClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();
  return data;
});
```

**Arquivos a atualizar:**

- `src/features/discovery/actions/books.actions.ts`
- `src/features/book-details/actions/*`
- `src/features/profile/actions/*`

**Critério de conclusão:** Queries idênticas no mesmo request são deduplicadas.

---

### 3.2 Corrigir Seletores do Zustand com `useShallow`

**Problema:** Componentes re-renderizam quando qualquer parte do store muda, mesmo que o dado utilizado não tenha mudado.

**Solução:**

```typescript
// ❌ Antes (em qualquer widget usando store)
const { favorites, addFavorite, removeFavorite } = useFavoritesStore();

// ✅ Depois
import { useShallow } from "zustand/react/shallow";

const { favorites, addFavorite, removeFavorite } = useFavoritesStore(
  useShallow((state) => ({
    favorites: state.favorites,
    addFavorite: state.addFavorite,
    removeFavorite: state.removeFavorite,
  })),
);
```

**Arquivos a auditar:**

- `src/shared/store/favorites.store.ts` e todos os consumidores
- `src/shared/storage/use-auth-store.ts` e consumidores
- `src/shared/store/category-cache.store.ts` e consumidores

**Critério de conclusão:** Profiler do React não mostra re-renders desnecessários nos componentes de listing.

---

### 3.3 Substituir Barrel Files por Imports Diretos

**Problema:** `src/shared/ui/index.ts` e `src/shared/widgets/index.ts` exportam tudo, impedindo tree-shaking.

**Solução — Opção A (sem refatoração de arquivos):** Migrar imports nos arquivos consumidores:

```typescript
// ❌ Antes
import { Button, Avatar, BookCard } from "@/shared/ui";

// ✅ Depois
import { Button } from "@/shared/ui/button.ui";
import { Avatar } from "@/shared/ui/avatar.ui";
import { BookCard } from "@/shared/widgets/book-card.widget";
```

**Solução — Opção B (estrutural):** Adicionar `sideEffects: false` em `package.json` e adicionar anotações nos barrel files:

```typescript
// src/shared/ui/index.ts
export { Button } from "./button.ui"; // tree-shakeable se sideEffects: false
```

Adicionar regra ESLint para prevenir regressão:

```javascript
// eslint.config.mjs — adicionar regra
'no-restricted-imports': ['error', {
  patterns: [{ group: ['@/shared/ui', '@/shared/widgets'], message: 'Prefira imports diretos para otimizar bundle.' }]
}]
```

**Critério de conclusão:** Bundle analyzer mostra redução no chunk inicial.

---

### 3.4 Implementar Otimização de Imagens com `<Image>`

**Problema:** Capas de livros carregadas como CSS backgrounds ou `<img>` sem otimização do Next.js.

**Solução:**

```typescript
// src/shared/widgets/book-cover.widget.tsx
import Image from 'next/image'
import { useState } from 'react'

interface BookCoverProps {
  src?: string
  title: string
  fallbackColor?: string
}

export function BookCover({ src, title, fallbackColor = '#1a1a2e' }: BookCoverProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: fallbackColor }}
        aria-label={`Capa: ${title}`}
      >
        {title.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={`Capa do livro: ${title}`}
      fill
      className="object-cover"
      onError={() => setError(true)}
      sizes="(max-width: 768px) 50vw, 25vw"
    />
  )
}
```

Atualizar `next.config.ts` com domínios permitidos:

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};
```

**Critério de conclusão:** Lighthouse mostra melhoria em LCP e imagens com lazy loading automático.

---

### 3.5 Queries com Colunas Explícitas (sem `SELECT *`)

**Problema:** `.select("*")` em tabelas grandes transfere dados desnecessários.

**Solução:**

```typescript
// ❌ Antes
supabase.from("user_books").select("*");

// ✅ Depois — especificar apenas colunas necessárias
supabase.from("user_books").select("id, title, cover_url, status, updated_at");

// Para joins, usar sintaxe do Supabase
supabase.from("user_books").select(`
  id, title, status,
  profiles ( username, avatar_url )
`);
```

**Arquivos a atualizar:**

- `src/server/infrastructure/database/supabase-user-book.repository.ts`
- `src/server/infrastructure/database/supabase-book.repository.ts`
- Demais repositories em `src/server/infrastructure/database/`

**Critério de conclusão:** Nenhum `.select("*")` nos repositories.

---

## Fase 4 — Arquitetura e Consistência

> **Objetivo:** Eliminar duplicações e padronizar padrões de acesso a dados.

### 4.1 Padronizar Acesso a Dados no Repository Pattern

**Problema:** Algumas features acessam Supabase diretamente em actions, outras via repositories — criando dois caminhos de dados.

**Solução:**

Regra: **Actions chamam repositories, repositories acessam Supabase.**

```
features/auth/actions/auth.actions.ts
    ↓
server/infrastructure/database/supabase-profile.repository.ts
    ↓
Supabase Client
```

Para features que ainda acessam diretamente:

```typescript
// ❌ Antes — em auth.actions.ts
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId);

// ✅ Depois — em auth.actions.ts
import { profileRepository } from "@/server/infrastructure/database/supabase-profile.repository";
const profile = await profileRepository.findById(userId);
```

**Arquivos a criar:**

- `src/server/infrastructure/database/supabase-profile.repository.ts` (se não existir)
- `src/server/infrastructure/database/supabase-favorite.repository.ts`

**Critério de conclusão:** Nenhum import do Supabase client diretamente em actions de features.

---

### 4.2 Centralizar Tipo `PageProps`

**Problema:** Tipo `PageProps` com `searchParams: Promise<...>` redefinido em múltiplas pages.

**Solução:**

Criar `src/shared/types/next.types.ts`:

```typescript
export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

export type LayoutProps<TParams = Record<string, string>> = {
  params: Promise<TParams>;
  children: React.ReactNode;
};
```

Atualizar todas as pages para importar deste arquivo.

**Critério de conclusão:** Sem redefinição local de `PageProps`.

---

### 4.3 Unificar Constantes de Categorias

**Problema:** Array de categorias de livros hardcoded em `src/app/book/[id]/book-page-client.tsx` em vez de usar a constante centralizada.

**Solução:**

Verificar constante existente (provavelmente `BOOK_CATEGORIES` em `src/server/domain/entities/book.entity.ts` ou `src/shared/config/`).

Em `book-page-client.tsx`:

```typescript
// ❌ Antes
const CATEGORIES = ['Romance', 'Ficção Científica', 'Terror', ...]

// ✅ Depois
import { BOOK_CATEGORIES } from '@/shared/config/constants'
```

**Critério de conclusão:** Uma única fonte de verdade para categorias.

---

### 4.4 Implementar Optimistic Updates nos Favoritos

**Problema:** Adicionar/remover favorito espera resposta do servidor antes de atualizar UI, gerando latência percebida.

**Solução:**

```typescript
// src/features/discovery/hooks/use-favorites.ts
export function useFavorites() {
  const { favorites, setFavorites } = useFavoritesStore();

  const toggleFavorite = async (bookId: string) => {
    const isFavorite = favorites.includes(bookId);

    // 1. Atualizar UI imediatamente (optimistic)
    setFavorites(
      isFavorite
        ? favorites.filter((id) => id !== bookId)
        : [...favorites, bookId],
    );

    // 2. Sincronizar com servidor
    const result = isFavorite
      ? await removeFromFavoritesAction(bookId)
      : await addToFavoritesAction(bookId);

    // 3. Reverter se falhou
    if (!result.ok) {
      setFavorites(favorites); // rollback
      toast.error(result.error.message);
    }
  };

  return { favorites, toggleFavorite };
}
```

**Critério de conclusão:** Toggle de favorito responde instantaneamente na UI.

---

## Fase 5 — Qualidade de Código e Type Safety

> **Objetivo:** Aumentar confiabilidade do refactoring e eliminar code smells.

### 5.1 Eliminar `any` nos Testes

**Problema:** Mocks em testes usam `any`, perdendo verificação de tipos.

**Solução:**

```typescript
// ❌ Antes
vi.mock('@/shared/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

// ✅ Depois
import type { ButtonProps } from '@/shared/ui/button.ui'

vi.mock('@/shared/ui/button.ui', () => ({
  Button: ({ children, onClick, disabled, type }: ButtonProps) => (
    <button onClick={onClick} disabled={disabled} type={type}>{children}</button>
  )
}))
```

**Critério de conclusão:** Zero uso de `any` em arquivos `*.test.tsx` e `*.test.ts`.

---

### 5.2 Type Guards para Entidades de Domínio

**Problema:** Sem forma de distinguir `Book` de `UserBook` em runtime.

**Solução:**

```typescript
// src/server/domain/entities/book.entity.ts
export type Book = {
  readonly __type: "book";
  id: string;
  title: string;
  authorId: string;
  // ...
};

export type UserBook = {
  readonly __type: "user-book";
  id: string;
  userId: string;
  bookId: string;
  // ...
};

// Type guards
export const isBook = (v: unknown): v is Book =>
  typeof v === "object" && v !== null && (v as Book).__type === "book";

export const isUserBook = (v: unknown): v is UserBook =>
  typeof v === "object" && v !== null && (v as UserBook).__type === "user-book";

// Factories garantem o discriminador
export const createBook = (data: Omit<Book, "__type">): Book => ({
  __type: "book",
  ...data,
});
```

**Critério de conclusão:** Type guards usados em todos os locais onde o tipo pode ser ambíguo.

---

### 5.3 Regras ESLint Adicionais

**Problema:** Código inconsistente que poderia ser prevenido por lint.

**Solução:** Adicionar regras em `eslint.config.mjs`. O projeto usa flat config (`defineConfig` + array), então as regras devem ser um objeto separado no array:

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // ⬇️ Regras customizadas
  {
    rules: {
      // Proibir any explícito
      '@typescript-eslint/no-explicit-any': 'error',
      // Proibir console.log (console.error/warn permitidos)
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      // Forçar imports diretos (evitar barrel files)
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/shared/ui', '@/shared/widgets'], message: 'Use import direto do arquivo.' }
        ]
      }],
      // Retorno explícito em funções async
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
    },
  },
]);

export default eslintConfig;
```

**Critério de conclusão:** `bun run lint` sem warnings de `any` ou `console.log`.

---

## Fase 6 — Cobertura de Testes

> **Objetivo:** Garantir que alterações futuras não quebrem funcionalidades críticas.

### 6.1 Testes Unitários para Repositories

**Prioridade:** Alta (base da lógica de negócio)

**Solução:**

```typescript
// tests/unit/repositories/supabase-book.repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseBookRepository } from "@/server/infrastructure/database/supabase-book.repository";

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock("@/lib/supabase/server-client", () => ({
  getServerClient: vi.fn().mockResolvedValue(mockSupabase),
}));

describe("SupabaseBookRepository", () => {
  const repo = new SupabaseBookRepository();

  it("retorna livro por ID quando existe", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: "1", title: "Test" },
      error: null,
    });
    const result = await repo.findById("1");
    expect(result?.id).toBe("1");
  });

  it("retorna null quando livro não existe", async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });
    const result = await repo.findById("999");
    expect(result).toBeNull();
  });
});
```

**Cobertura mínima alvo:**

- `supabase-book.repository.ts` → 80%
- `supabase-user-book.repository.ts` → 80%
- `supabase-profile.repository.ts` → 80%
- `book.mapper.ts` → 100% (lógica pura)

---

### 6.2 Testes Unitários para Mappers

```typescript
// tests/unit/mappers/book.mapper.test.ts
import { mapToBookEntity } from "@/server/infrastructure/mappers/book.mapper";

describe("mapToBookEntity", () => {
  it("mapeia corretamente registro do DB para entidade", () => {
    const dbRecord = {
      id: "1",
      title: "Test",
      author_id: "a1",
      created_at: "2024-01-01",
    };
    const entity = mapToBookEntity(dbRecord);
    expect(entity.__type).toBe("book");
    expect(entity.authorId).toBe("a1"); // snake_case → camelCase
  });

  it("lança erro para registro incompleto", () => {
    expect(() => mapToBookEntity({})).toThrow();
  });
});
```

---

### 6.3 Testes de Integração para Server Actions

```typescript
// tests/integration/actions/books.actions.test.ts
import { describe, it, expect } from "vitest";
import { getBooks } from "@/features/discovery/actions/books.actions";

// Usa supabase real ou MSW para mockar HTTP
describe("getBooks action", () => {
  it("retorna ActionResult com ok: true em caso de sucesso", async () => {
    const result = await getBooks({ page: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });

  it("retorna ActionResult com ok: false para input inválido", async () => {
    const result = await getBooks({ page: -1 }); // inválido
    expect(result.ok).toBe(false);
  });
});
```

---

### 6.4 Cobertura E2E para Fluxos Críticos

**Fluxos prioritários a implementar/verificar em `e2e/`:**

```typescript
// e2e/library/publish-book.spec.ts — fluxo completo de publicação
test("autor cria e publica livro", async ({ page }) => {
  await page.goto("/login");
  // ... login como autor
  await page.goto("/book-dashboard/new");
  await page.fill('[name="title"]', "Meu Livro Teste");
  await page.click('[data-testid="publish-button"]');
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});

// e2e/discovery/favorites-flow.spec.ts — favoritar como usuário anônimo → login → migrar
test("anônimo favorita → faz login → favorito persiste", async ({ page }) => {
  await page.goto("/explore");
  await page.click('[data-testid="favorite-button-book-1"]');
  // ... login
  await expect(page.locator('[data-testid="favorite-count"]')).toContainText(
    "1",
  );
});
```

**Critério de conclusão:** Cobertura E2E nos 5 fluxos críticos: auth, publicação, favoritos, leitura e perfil.

---

## Fase 7 — Observabilidade e Infraestrutura

> **Objetivo:** Tornar problemas em produção visíveis e diagnosticáveis.

### 7.1 Integrar Sentry para Rastreamento de Erros

```bash
bun add @sentry/nextjs
bunx @sentry/wizard@latest -i nextjs
```

Configuração mínima em `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% em produção
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Nunca enviar dados de usuário identificável
    delete event.user?.email;
    return event;
  },
});
```

Integrar com `toUserError`:

```typescript
// src/shared/lib/action-error.ts — atualizar
import * as Sentry from "@sentry/nextjs";

export function toUserError(error: unknown): string {
  Sentry.captureException(error); // rastrear em produção
  console.error("[ServerAction Error]", error);
  return "Ocorreu um erro inesperado. Tente novamente.";
}
```

---

### 7.2 Implementar Logger Estruturado

**Problema:** `console.error` espalhado por toda a codebase sem contexto ou níveis.

**Solução:**

Criar `src/shared/lib/logger.ts`:

```typescript
type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "production") {
    // Em produção: JSON estruturado para Vercel Logs / Sentry
    console[level](JSON.stringify(entry));
  } else {
    console[level](`[${entry.timestamp}] ${message}`, context ?? "");
  }
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};
```

Substituir `console.error` nos repositories e actions por `logger.error`.

---

### 7.3 Adicionar Health Check Aprimorado

**Problema:** `src/app/api/health/route.ts` existe mas provavelmente não verifica conectividade real.

**Solução:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export async function GET() {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "unknown",
    checks: {
      database: "unknown" as "ok" | "error",
    },
  };

  try {
    const supabase = await getSupabaseServerClient();
    await supabase.from("books").select("id").limit(1);
    checks.checks.database = "ok";
  } catch {
    checks.checks.database = "error";
    checks.status = "degraded";
  }

  const statusCode = checks.status === "ok" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
```

---

## Checklist Geral de Conclusão

### Fase 0 — Correções do Plano ✅

- [x] `bun add zod` removido do plano (já instalado v4.3.6)
- [x] Consolidação de clients Supabase corrigida (5 padrões mapeados, não 2)
- [x] Caminhos de import dos clients Supabase corrigidos (usam paths reais do projeto)
- [x] Formato do ESLint config corrigido para flat config (`defineConfig`)

### Fase 1 — Segurança ✅

- [x] `src/shared/config/env.ts` criado com validação Zod
- [x] `src/shared/lib/action-error.ts` criado
- [x] Erros internos não chegam mais ao cliente
- [x] `src/proxy.ts` atualizado: `getUser()` no lugar de `getSession()`, redirect para autenticados em `/login`/`/register`, `/my-session` removida das rotas públicas
- [x] Client Supabase consolidado em dois arquivos únicos

### Fase 2 — Erros e Validação ✅

- [x] `src/shared/types/action-result.ts` criado com `ActionResult<T>`, `success()`, `failure()`
- [x] Actions refatoradas para usar `ActionResult<T>`: auth, favorites, profile, author-follow, rate-book
- [x] Componentes consumidores atualizados: login-form, register-form, use-favorites, use-profile-form, anonymous-persistence, use-action-toast
- [x] Schemas Zod criados: auth, discovery, profile, library
- [x] Validação Zod aplicada em `signInWithEmail`, `signUpWithEmail`, `updateUserProfile`
- [x] `ErrorBoundary` criado e aplicado no `dashboard-shell-client.tsx` (Header + children)

### Fase 3 — Performance ✅

- [x] `React.cache()` em queries de servidor
- [x] `useShallow()` em todos os seletores Zustand
- [x] Barrel files substituídos por imports diretos
- [x] `<Image>` do Next.js em capas de livros
- [x] Zero `SELECT *` nos repositories

### Fase 4 — Arquitetura ✅

- [x] Actions chamam repositories (sem Supabase direto)
- [x] `src/shared/types/next.types.ts` com `PageProps` centralizado
- [x] Constante de categorias unificada
- [x] Optimistic updates nos favoritos

### Fase 5 — Type Safety

- [ ] Zero `any` em arquivos de teste
- [ ] Type guards para `Book` e `UserBook`
- [ ] Regras ESLint adicionais aplicadas

### Fase 6 — Testes

- [ ] Testes unitários para repositories (>80% cobertura)
- [ ] Testes unitários para mappers (100%)
- [ ] Testes de integração para actions
- [ ] E2E cobrindo 5 fluxos críticos

### Fase 7 — Observabilidade

- [ ] Sentry integrado e configurado
- [ ] Logger estruturado substituindo `console.error`
- [ ] Health check verificando conectividade real

---

## Referências Técnicas

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React cache()](https://react.dev/reference/react/cache)
- [Zustand useShallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
- [Supabase SSR Client](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Zod Validation](https://zod.dev/)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
