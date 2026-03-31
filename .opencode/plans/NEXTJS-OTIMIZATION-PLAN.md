# Plano de Otimização Next.js - Conta.AI

**Branch:** `feature/db-optimization`  
**Date:** 2026-03-30  
**Status:** Pendente (Aguardando Implementação)

---

## 1. Resumo Executivo

Este documento apresenta as oportunidades de otimização no código Next.js identificadas após as melhorias no banco de dados. Baseado na análise do `sql-optimization-plan.md`, foram identificadas 4 áreas principais de melhoria no código frontend.

---

## 2. Análise do Estado Atual

### 2.1 Problemas Identificados no Código

| # | Problema | Impacto | Prioridade | Arquivo(s) |
|---|----------|---------|------------|-------------|
| P1 | `unified_books` VIEW não utilizada | Queries redundantes | Alta | `server-books.ts` |
| P2 | `getSupabaseAdmin()` duplicado | Código duplicado | Média | `books.actions.ts` |
| P3 | `formatBook()` duplicado | Código duplicado | Média | `books.actions.ts`, `server-books.ts` |
| P4 | Paginação em memória | Performance | Média | `server-books.ts:274` |

### 2.2 Análise Detalhada

#### P1: VIEW `unified_books` Não Utilizada

**Localização:** `src/features/book-dashboard/data/server-books.ts`

**Problema:**
```typescript
// ❌ Código atual: 2 queries separadas
const books = await fetchBooksFromSupabase(filters);  // Query 1: books table
const { data: userBooks } = await supabase
  .from("user_books")  // Query 2: user_books table
  .select("...")
  .eq("status", "published");
```

**Recomendação:**
```typescript
// ✅ Usar VIEW unificada - 1 query
const { data, error } = await supabase
  .from("unified_books")
  .select("id, title, author, source, ...")
  .order("created_at", { ascending: false });
```

---

#### P2: `getSupabaseAdmin()` Duplicado

**Localização:** `src/features/book-dashboard/actions/books.actions.ts:43`

**Problema:**
```typescript
// ❌ Função duplicada em books.actions.ts
async function getSupabaseAdmin() {
  const { createServerClient } = await import("@supabase/ssr");
  // ... implementação inline
}
```

**Recomendação:**
```typescript
// ✅ Criar utilitário centralizado
// Arquivo: src/lib/supabase/admin.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components
        }
      },
    },
  });
}
```

---

#### P3: `formatBook()` Duplicado

**Localização:** 
- `src/features/book-dashboard/actions/books.actions.ts:21`
- `src/features/book-dashboard/data/server-books.ts:28`

**Problema:**
```typescript
// ❌ Duplicado em 2 arquivos
function formatBook(book: SupabaseBook): Book {
  const validCategories = ["Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"];
  // ... lógica idêntica
}
```

**Recomendação:**
```typescript
// ✅ Criar utilitário centralizado
// Arquivo: src/lib/books/format-book.ts

import { Book } from "@/features/book-dashboard/types/book.types";

type SupabaseBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  pages: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
};

const VALID_CATEGORIES: Book["category"][] = [
  "Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"
];

export function formatBook(book: SupabaseBook): Book {
  const category = VALID_CATEGORIES.includes(book.category as Book["category"]) 
    ? book.category as Book["category"] 
    : "Drama" as Book["category"];

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category,
    pages: book.pages || 0,
    rating: typeof book.rating === "string" 
      ? parseFloat(book.rating) 
      : (book.rating || 0),
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

export function formatUserBook(book: UserBookRow): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: "",
    category: book.category as Book["category"],
    pages: Math.ceil((book.word_count || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: new Date(book.created_at),
  };
}
```

---

#### P4: Paginação em Memória

**Localização:** `src/features/book-dashboard/data/server-books.ts:274`

**Problema:**
```typescript
// ❌ Paginação em memória (ineficiente para grandes volumes)
const allBooks = [...catalogBooks, ...userBooks];
const paginatedBooks = allBooks.slice(startIndex, endIndex);
```

**Recomendação:**

**Opção A - Usar OFFSET/LIMIT no banco:**
```typescript
// Com VIEW unificada, usar paginação no banco
const { data, count } = await supabase
  .from("unified_books")
  .select("*", { count: "exact" })
  .range(offset, offset + limit - 1)
  .order("created_at", { ascending: false });
```

**Opção B - Manter paginação em memória (se volumes são baixos):**
- Manter como está para simplicidade
- Adicionar comentário documentando a escolha

---

## 3. Plano de Ação

### Fase 1: Utilização da VIEW `unified_books`
**Prioridade:** Alta | **Estimativa:** 1 dia

#### 1.1 Atualizar `server-books.ts`

**Arquivo:** `src/features/book-dashboard/data/server-books.ts`

```typescript
// ✅ Nova implementação usando VIEW

import { createClient } from "@/utils/supabase/server";
import { cache } from "react";
import { formatBook, formatUserBook } from "@/lib/books/format-book";
import type { Book } from "@/features/book-dashboard/types/book.types";

type UnifiedBookRow = {
  source: "catalog" | "user";
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  page_count: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
  user_id: string | null;
  status: string | null;
};

export type BooksFilters = {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export const getBooks = cache(async (filters?: BooksFilters): Promise<Book[]> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("unified_books")
    .select("source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at, user_id, status")
    .order("created_at", { ascending: false });

  if (filters?.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching books:", error);
    return [];
  }

  return (data || []).map((book: UnifiedBookRow) => {
    if (book.source === "catalog") {
      return formatBook(book as any);
    }
    return formatUserBook({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      cover_color: book.cover_color,
      category: book.category,
      word_count: (book.page_count || 0) * 500,
      created_at: book.created_at,
    } as any);
  });
});
```

---

### Fase 2: Consolidação de Código
**Prioridade:** Média | **Estimativa:** 0.5 dia

#### 2.1 Criar utilitário `format-book.ts`

**Arquivo:** `src/lib/books/format-book.ts`

```typescript
import type { Book } from "@/features/book-dashboard/types/book.types";

type SupabaseBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  pages: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
};

type UserBookRow = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  category: string;
  word_count: number | null;
  created_at: string;
};

const VALID_CATEGORIES: Book["category"][] = [
  "Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"
];

export function formatBook(book: SupabaseBook): Book {
  const category = VALID_CATEGORIES.includes(book.category as Book["category"]) 
    ? book.category as Book["category"] 
    : "Drama" as Book["category"];

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category,
    pages: book.pages || 0,
    rating: typeof book.rating === "string" 
      ? parseFloat(book.rating) 
      : (book.rating || 0),
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

export function formatUserBook(book: UserBookRow): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: "",
    category: book.category as Book["category"],
    pages: Math.ceil((book.word_count || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: new Date(book.created_at),
  };
}
```

#### 2.2 Criar utilitário `get-supabase-admin.ts`

**Arquivo:** `src/lib/supabase/get-supabase-admin.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components
        }
      },
    },
  });
}
```

#### 2.3 Atualizar imports em `books.actions.ts`

```typescript
// Remover getSupabaseAdmin() e formatBook() locais
// Adicionar imports:

import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";
import { formatBook } from "@/lib/books/format-book";
```

---

### Fase 3: Melhoria de Paginação
**Prioridade:** Média | **Estimativa:** 0.5 dia

#### 3.1 Atualizar `getBooksPaginated()`

**Arquivo:** `src/features/book-dashboard/data/server-books.ts`

```typescript
// ✅ Usar VIEW com paginação no banco
export const getBooksPaginated = cache(async (
  page: number = 1,
  limit: number = 10,
  category?: string,
  search?: string
): Promise<BooksResponse> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const offset = (page - 1) * limit;

  let query = supabase
    .from("unified_books")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (search) {
    const searchTerm = search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching books:", error);
    return { books: [], total: 0, page, totalPages: 0 };
  }

  const books = (data || []).map((book: UnifiedBookRow) => {
    // Mapear conforme tipo (catalog ou user)
    return book.source === "catalog" 
      ? formatBook(book as any) 
      : formatUserBook(book as any);
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { books, total, page, totalPages };
});
```

---

## 4. Estrutura de Arquivos Proposta

```
src/
├── lib/
│   ├── books/
│   │   └── format-book.ts          # [NOVO] formatBook, formatUserBook
│   └── supabase/
│       ├── server.ts               # existente
│       ├── client.ts               # existente
│       └── get-supabase-admin.ts   # [NOVO] getSupabaseAdmin consolidado
└── features/
    └── book-dashboard/
        ├── actions/
        │   └── books.actions.ts    # [ATUALIZAR] remover duplicações
        └── data/
            └── server-books.ts     # [ATUALIZAR] usar unified_books VIEW
```

---

## 5. Checklist de Implementação

### Fase 1 - VIEW unified_books
- [ ] Criar arquivo `src/lib/books/format-book.ts`
- [ ] Criar arquivo `src/lib/supabase/get-supabase-admin.ts`
- [ ] Atualizar `server-books.ts` para usar VIEW
- [ ] Testar listagem de livros
- [ ] Testar busca/categoria

### Fase 2 - Consolidação
- [ ] Atualizar imports em `books.actions.ts`
- [ ] Remover `getSupabaseAdmin()` duplicado
- [ ] Remover `formatBook()` duplicado
- [ ] Verificar lint passa

### Fase 3 - Paginação
- [ ] Atualizar `getBooksPaginated()`
- [ ] Testar paginação
- [ ] Verificar contagem correta

---

## 6. Ganhos Estimados

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Queries por listagem | 2 | 1 | 50% redução |
| Linhas de código duplicado | ~60 | 0 | 100% redução |
| Complexidade de manutenção | Alta | Baixa | Simplificado |

---

## 7. Testes Recomendados

```typescript
// Testar listagem de livros
describe("Books", () => {
  it("should fetch all books from unified view", async () => {
    const books = await getBooks();
    expect(books.length).toBeGreaterThan(0);
  });

  it("should filter by category", async () => {
    const books = await getBooks({ category: "Drama" });
    expect(books.every(b => b.category === "Drama")).toBe(true);
  });

  it("should search books", async () => {
    const books = await getBooks({ search: "test" });
    expect(books.length).toBeGreaterThanOrEqual(0);
  });
});
```

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Breaking changes na VIEW | Baixa | Médio | Testes E2E antes de deploy |
| performance degrade | Baixa | Médio | Monitorar queries após mudança |
| Migration não aplicada | Alta | Alto | Verificar migrations antes de deploy |

---

## 9. Rollback Procedure

Se houver problemas após deploy:

```bash
# 1. Reverter código
git checkout HEAD~1 -- src/features/book-dashboard/data/server-books.ts
git checkout HEAD~1 -- src/features/book-dashboard/actions/books.actions.ts

# 2. Deploy código antigo
git push

# 3. Investigar problema
```

---

## 10. Próximos Passos

1. **Revisar este documento** com a equipe
2. **Priorizar implementações** (Fase 1 é a mais impactante)
3. **Criar branch** para cada fase se necessário
4. **Implementar** com testes automatizados
5. **Deploy gradual** com feature flags se possível

---

*Documento gerado em: 2026-03-30*  
*Branch: feature/db-optimization*  
*Status: Pendente de implementação*
