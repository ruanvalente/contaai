# Plano de Spec Driven Development (SDD) - Conta.AI

**Branch:** `feature/sdd-architecture`  
**Date:** 2026-03-30  
**Status:** Pendente (Aguardando Implementação)

---

## 1. Resumo Executivo

Este documento apresenta o plano de transição para **Spec Driven Development (SDD)** no projeto Conta.AI. O objetivo é estabelecer contratos formais (DTOs), use cases isolados e repositories centralizados para melhorar testabilidade, manutenibilidade e documentação do código.

### Objetivos Principais

- [ ] Estabelecer SDD como metodologia de desenvolvimento
- [ ] Definir contratos formais (DTOs com Zod) para todas as features
- [ ] Criar camada de use cases isolada
- [ ] Centralizar acesso ao Supabase via repositories
- [ ] Padronizar Server Actions como entry points
- [ ] Separar UI (presentacional) de Widgets (com estado)

---

## 2. Contexto e Motivação

### 2.1 Por que SDD?

| Benefício | Descrição |
|-----------|-----------|
| **Contratos claros** | DTOs definem exatamente o formato de dados esperado |
| **Testabilidade** | Use cases isolados podem ser testados sem dependência de UI |
| **Manutenibilidade** | Mudanças de regras não afetam componentes visuais |
| **Documentação automática** | Specs servem como documentação viva |
| **Type safety** | Zod + TypeScript = validação em runtime e compile time |

### 2.2 Stack Atual

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16.2.0 (App Router) |
| Linguagem | TypeScript |
| UI | React 19.2.4, Tailwind CSS 4 |
| Estado | Zustand |
| Banco | Supabase (PostgreSQL + Auth) |
| Validação | ❌ Ausente |

---

## 3. Análise da Arquitetura Atual

### 3.1 Pontos Fortes

| Aspecto | Status | Observação |
|---------|--------|------------|
| Estrutura feature-based | ✅ Bom | `src/features/` organizado por domínio |
| Separação UI/Widgets | ✅ Parcial | 70% implementado |
| Server Actions | ✅ Bom | Usadas como entry points |
| Types separados | ✅ Bom | Arquivos `types/` por feature |
| Zustand para estado | ✅ Bom | Stores bem estruturados |

### 3.2 Problemas Identificados

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| 1 | **Sem DTOs validados** | `books.actions.ts` | Sem contrato de entrada/saída |
| 2 | **Infra duplicada** | Cada action cria Supabase | Manutenção difícil |
| 3 | **Use cases ausentes** | Lógica nos actions/hooks | Dificulta teste |
| 4 | **API Routes redundantes** | `/api/books` vs actions | Duplicidade |
| 5 | **Specs ausentes** | Todo o projeto | Sem fonte de verdade |
| 6 | **Validação manual** | if-else nos actions | Propenso a erros |

### 3.3 Exemplos de Código Atual

#### Action sem DTO (`books.actions.ts:74-93`)

```typescript
// ❌ Problema: Sem validação estruturada
export async function getBooksAction(): Promise<Book[]> {
  try {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from("books")
      .select("...")
      .order("created_at", { ascending: false });
    // ...
  }
}
```

#### Infra duplicada em cada action (`books.actions.ts:43-72`)

```typescript
// ❌ Problema: Instância do Supabase em cada arquivo
async function getSupabaseAdmin() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  // ...código repetido
}
```

#### Hook com lógica de negócio (`use-favorites.ts:60-77`)

```typescript
// ❌ Problema: Lógica de negócio no hook
const addFavorite = useCallback(async (book: Book) => {
  setLoading(true);
  try {
    const result = await addToFavorites(/* parâmetros */);
    if (result.success) {
      addFavoriteToStore(book.id);
    }
  }
}, [/* dependências */]);
```

---

## 4. Arquitetura Proposta

### 4.1 Estrutura de Pastas por Feature

```
src/features/[feature-name]/
│
├── specs/                         # 📜 CONTRATOS (fonte de verdade)
│   ├── dto.ts                    # Zod schemas + TypeScript types
│   ├── use-case.spec.ts          # Descrição formal do caso de uso
│   └── rules.ts                  # Regras de validação de negócio
│
├── domain/                        # 🏛️ ENTIDADES
│   └── entities/
│       └── [feature].entity.ts   # Entidade com métodos de domínio
│
├── application/                   # 🎯 USE CASES
│   ├── get-[feature].use-case.ts
│   ├── create-[feature].use-case.ts
│   ├── update-[feature].use-case.ts
│   └── delete-[feature].use-case.ts
│
├── infra/                         # 🔧 INFRAESTRUTURA
│   ├── repositories/
│   │   └── [feature].repository.ts
│   └── supabase/
│       └── client.ts
│
├── actions/                       # 🚀 SERVER ACTIONS
│   └── [feature].action.ts
│
├── ui/                           # 🎨 COMPONENTES VISUAIS
│   └── [component].ui.tsx
│
└── widgets/                      # 🧩 COMPONENTES COM ESTADO
    └── [component].widget.tsx
```

### 4.2 Diagrama de Fluxo

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   UI Layer   │────▶│   Widget     │────▶│   Server     │
│  (React)     │     │  (State)     │     │   Action     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │   Use Case   │◀──── dto.ts (validação)
                                         │  (Lógica)    │      │
                                         └──────────────┘      │
                                                  │            │
                                                  ▼            │
                                         ┌──────────────┐      │
                                         │  Repository  │──────┘
                                         │  (Supabase) │
                                         └──────────────┘
```

---

## 5. Definição de Padrões

### 5.1 Padrão DTO

**Arquivo:** `src/features/[feature]/specs/dto.ts`

```typescript
import { z } from 'zod'

// Schema de entrada
export const CreateBookDTO = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  coverUrl: z.string().url().optional(),
  coverColor: z.string().hex().default('#8B4513'),
  description: z.string().max(2000).default(''),
  category: z.enum(['Drama', 'Fantasy', 'Sci-Fi', 'Business', 'Education', 'Geography']),
  pages: z.number().int().min(0).default(0),
})

// Schema de saída
export const BookDTO = CreateBookDTO.extend({
  id: z.string().uuid(),
  rating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().min(0).default(0),
  reviewCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
})

// Schema para listagem
export const BookListDTO = BookDTO.pick({
  id: true,
  title: true,
  author: true,
  coverUrl: true,
  coverColor: true,
  category: true,
  rating: true,
})

// Tipos inferidos
export type CreateBookInput = z.infer<typeof CreateBookDTO>
export type Book = z.infer<typeof BookDTO>
export type BookListItem = z.infer<typeof BookListDTO>
```

### 5.2 Padrão Use Case

**Arquivo:** `src/features/[feature]/application/get-books.use-case.ts`

```typescript
import { cache } from 'react'
import { BookRepository } from '@/features/[feature]/infra/repositories/book.repository'
import { BookListDTO, CreateBookInput, Book } from '../specs/dto'

export interface GetBooksInput {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface GetBooksOutput {
  books: BookListDTO[]
  total: number
  page: number
  totalPages: number
}

export class GetBooksUseCase {
  constructor(private readonly bookRepo: BookRepository) {}

  async execute(input: GetBooksInput): Promise<GetBooksOutput> {
    // 1. Validação de business rules
    if (input.limit && (input.limit < 1 || input.limit > 100)) {
      throw new Error('Limit must be between 1 and 100')
    }

    // 2. Executar query via repository
    const offset = input.offset ?? 0
    const limit = input.limit ?? 20
    
    const { books, total } = await this.bookRepo.findMany({
      category: input.category,
      search: input.search,
      limit,
      offset,
    })

    // 3. Mapear para DTO de saída
    return {
      books: books.map(this.toBookListDTO),
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    }
  }

  private toBookListDTO(book: Book): BookListDTO {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      coverColor: book.coverColor,
      category: book.category,
      rating: book.rating,
    }
  }
}

// Versão cached para Next.js
export const getBooksUseCase = cache(
  async (input: GetBooksInput): Promise<GetBooksOutput> => {
    const bookRepo = new BookRepository()
    const useCase = new GetBooksUseCase(bookRepo)
    return useCase.execute(input)
  }
)
```

### 5.3 Padrão Repository

**Arquivo:** `src/features/[feature]/infra/repositories/book.repository.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Book, BookListDTO } from '../../specs/dto'

export interface BookQueryParams {
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface BookQueryResult {
  books: Book[]
  total: number
}

export class BookRepository {
  private client: ReturnType<typeof createServerClient>

  constructor() {
    const cookieStore = cookies()
    this.client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )
  }

  async findMany(params: BookQueryParams): Promise<BookQueryResult> {
    let query = this.client
      .from('books')
      .select('*', { count: 'exact' })

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%`)
    }

    const { data, count, error } = await query
      .range(params.offset ?? 0, (params.limit ?? 20) - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch books: ${error.message}`)
    }

    return {
      books: (data ?? []).map(this.mapToEntity),
      total: count ?? 0,
    }
  }

  async findById(id: string): Promise<Book | null> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    
    return this.mapToEntity(data)
  }

  private mapToEntity(row: Record<string, unknown>): Book {
    return {
      id: row.id as string,
      title: row.title as string,
      author: row.author as string,
      coverUrl: row.cover_url as string | undefined,
      coverColor: (row.cover_color as string) ?? '#8B4513',
      description: (row.description as string) ?? '',
      category: row.category as Book['category'],
      pages: (row.pages as number) ?? 0,
      rating: (row.rating as number) ?? 0,
      ratingCount: (row.rating_count as number) ?? 0,
      reviewCount: (row.review_count as number) ?? 0,
      createdAt: new Date(row.created_at as string),
    }
  }
}
```

### 5.4 Padrão Server Action

**Arquivo:** `src/features/[feature]/actions/books.action.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { CreateBookDTO, BookDTO, BookListDTO, CreateBookInput, GetBooksInput } from '../specs/dto'
import { GetBooksUseCase, getBooksUseCase } from '../application/get-books.use-case'
import { CreateBookUseCase } from '../application/create-book.use-case'
import { BookRepository } from '../infra/repositories/book.repository'

// GET - Buscar livros
export async function getBooksAction(
  input: GetBooksInput
): Promise<{ success: true; data: GetBooksOutput } | { success: false; error: string }> {
  try {
    // 1. Validação via DTO (usar zod schemas)
    const result = await getBooksUseCase(input)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in getBooksAction:', error)
    return { success: false, error: 'Failed to fetch books' }
  }
}

// POST - Criar livro
export async function createBookAction(
  input: CreateBookInput
): Promise<{ success: true; data: Book } | { success: false; error: string }> {
  try {
    // 1. Validação via DTO
    const validated = CreateBookDTO.safeParse(input)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    // 2. Executar use case
    const bookRepo = new BookRepository()
    const useCase = new CreateBookUseCase(bookRepo)
    const result = await useCase.execute(validated.data)
    
    // 3. Revalidar cache
    revalidatePath('/dashboard')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in createBookAction:', error)
    return { success: false, error: 'Failed to create book' }
  }
}
```

### 5.5 Padrão UI (Presentacional)

**Arquivo:** `src/features/[feature]/ui/book-card.ui.tsx`

```typescript
import { BookListDTO } from '../specs/dto'
import { BookCover } from '@/shared/ui/book-cover'
import { StarRating } from '@/shared/ui/star-rating'
import { cn } from '@/utils/cn'

export interface BookCardUIProps {
  book: BookListDTO
  onClick?: (id: string) => void
  className?: string
}

export function BookCardUI({ book, onClick, className }: BookCardUIProps) {
  return (
    <button
      type="button"
      className={cn('cursor-pointer text-left bg-transparent border-none p-0', className)}
      onClick={() => onClick?.(book.id)}
      aria-label={`Ver detalhes do livro ${book.title}`}
    >
      <div className="flex flex-col items-center">
        <BookCover
          title={book.title}
          coverUrl={book.coverUrl}
          coverColor={book.coverColor}
          size="md"
        />
        
        <div className="mt-2 text-center w-full max-w-28">
          <h3 className="font-semibold text-gray-900 text-xs line-clamp-2">
            {book.title}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{book.author}</p>
          {book.rating > 0 && (
            <div className="mt-1 flex justify-center">
              <StarRating rating={book.rating} size="sm" showValue={false} />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
```

### 5.6 Padrão Widget (Com Estado)

**Arquivo:** `src/features/[feature]/widgets/book-list.widget.tsx`

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookCardUI } from '../ui/book-card.ui'
import { BookListSkeleton } from '@/shared/ui/skeleton.ui'
import { getBooksAction } from '../actions/books.action'
import { BookListDTO } from '../specs/dto'

export function BookListWidget() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [books, setBooks] = useState<BookListDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const category = searchParams.get('category') ?? undefined
  const search = searchParams.get('search') ?? undefined

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await getBooksAction({ category, search })
    
    if (result.success) {
      setBooks(result.data.books)
    } else {
      setError(result.error)
    }
    
    setIsLoading(false)
  }, [category, search])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  if (isLoading) return <BookListSkeleton />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCardUI
          key={book.id}
          book={book}
          onClick={(id) => router.push(`/book/${id}`)}
        />
      ))}
    </div>
  )
}
```

---

## 6. Plano de Implementação Incremental

### Fase 1: Fundamentos

| # | Tarefa | Entrega | Arquivo |
|---|--------|---------|---------|
| 1.1 | Adicionar `zod` como dependência | `package.json` atualizado | - |
| 1.2 | Criar utilitário de validação | `src/shared/utils/validation.ts` | Novo |
| 1.3 | Definir templates de pasta | Estrutura vazia | - |

**Dependência:**
```bash
bun add zod
```

### Fase 2: Feature Piloto - Books

| # | Tarefa | Entrega | Arquivo |
|---|--------|---------|---------|
| 2.1 | Criar DTOs para Books | `specs/dto.ts` | Novo |
| 2.2 | Criar spec de use case | `specs/use-case.spec.ts` | Novo |
| 2.3 | Criar repository | `infra/repositories/book.repository.ts` | Novo |
| 2.4 | Criar use cases | `application/get-books.use-case.ts` | Novo |
| 2.5 | Refatorar Server Action | `actions/books.action.ts` | Modificar |
| 2.6 | Separar UI/Widget | `ui/book-card.ui.tsx` + `widgets/` | Novo |

### Fase 3: Features Seguintes

| Feature | Complexidade | Prioridade |
|---------|--------------|------------|
| Profile | Média | Alta |
| Auth | Baixa | Alta |
| Favorites | Média | Alta |
| Discovery | Alta | Média |

### Fase 4: Refinamento

| # | Tarefa |
|---|--------|
| 4.1 | Remover API routes redundantes (`/api/books`, `/api/user-favorites`, etc) |
| 4.2 | Adicionar testes de use case |
| 4.3 | Documentar padrões no AGENTS.md |

---

## 7. Critérios de Sucesso

- [ ] Toda feature tem DTOs definidos com Zod
- [ ] Server Actions validam input via DTO
- [ ] Lógica de negócio está em use cases (não em actions/hooks)
- [ ] Queries Supabase estão isoladas em repositories
- [ ] UI components são puros (sem lógica)
- [ ] Widgets contêm apenas estado e chamadas de action
- [ ] API routes redundantes removidas

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Curva de aprendizado | Alta | Médio | Documentação + exemplos práticos |
| Overhead para CRUD | Média | Baixo | Usar apenas onde necessário |
| Zod no bundle | Baixa | Médio | Usar apenas no server (não enviar para client) |
| Refatoração longa | Alta | Alto | Incremental com testes |

---

## 9. Skills Relacionadas

| Skill | Aplicação |
|-------|-----------|
| **vercel-react-best-practices** | Server Actions otimizadas, React.cache() |
| **supabase-postgres-best-practices** | Queries, RLS, Índices |
| **typescript-advanced-types** | DTOs com Zod + TypeScript |
| **python-testing-patterns** (adaptado) | Testes de use case |

---

## 10. Próximos Passos

1. Revisar e aprovar este plano
2. Executar: `bun add zod`
3. Criar branch: `feature/sdd-architecture`
4. Implementar Fase 1: Fundamentos
5. Implementar Fase 2: Feature Books (piloto)
6. Revisar e ajustar padrões
7. Expandir para outras features
