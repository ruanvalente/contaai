# PLAN.md — Clean Architecture para Conta.AI

## Análise do Estado Atual

### Problemas Identificados

| Problema | Localização | Impacto |
|----------|-------------|---------|
| **Tipos duplicados entre features** | `book.types.ts` usado em discovery, library, reading | Acoplamento |
| **book-dashboard como "catch-all"** | Muita responsabilidade em uma feature | Violação SRP |
| **Lógica de formatação em lib/** | `format-book.ts` mistura presentation e domínio | Falta de camada |
| **Dependência circular** | discovery → book-dashboard/types | Dificulta manutenção |
| **Sem interfaces/abstrações** | Server Actions diretas em todo lugar | Difícil testar/mocar |

---

## Proposta: Full Clean Architecture

### Estrutura Proposta

```
src/
├── domain/                    # CAMADA DOMÍNIO (core)
│   ├── entities/              # Entidades do negócio
│   │   ├── book.entity.ts
│   │   ├── user.entity.ts
│   │   └── reading-progress.entity.ts
│   ├── repositories/          # Interfaces (contratos)
│   │   ├── book.repository.ts
│   │   ├── user.repository.ts
│   │   └── reading.repository.ts
│   └── usecases/              # Casos de uso
│       ├── get-books.usecase.ts
│       ├── favorite-book.usecase.ts
│       └── save-reading-progress.usecase.ts
│
├── infrastructure/            # CAMADA INFRAESTRUTURA
│   ├── database/              # Repositórios concretos
│   │   ├── supabase-book.repository.ts
│   │   └── supabase-user.repository.ts
│   ├── storage/              # Auth, cache
│   │   └── supabase-auth.storage.ts
│   └── api/                   # Server Actions (adapter)
│       ├── books.actions.ts
│       └── reading.actions.ts
│
├── features/                  # CAMADA APPLICATION (features)
│   ├── discovery/
│   ├── library/
│   ├── reading/
│   └── profile/
│
├── shared/                    # CAMADA PRESENTATION
│   ├── ui/
│   └── widgets/
│
└── lib/                       # Utils globais
```

### Camadas e Responsabilidades

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **domain/entities** | Definir tipos puros do negócio | `Book`, `User`, `ReadingProgress` |
| **domain/repositories** | Contratos (interfaces) | `IBookRepository.getAll()` |
| **domain/usecases** | Lógica de negócio pura | `GetBooksUseCase.execute()` |
| **infrastructure** | Implementação concreta | `SupabaseBookRepository` |
| **features** | Orquestração UI | Widgets, hooks |
| **shared** | Componentes visuais | Button, Card |

---

## Plano de Migração

### Fase 1: Criar domain/entities

Criar arquivo único com entidades:

```typescript
// src/domain/entities/book.entity.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  description: string;
  category: BookCategory;
  pages: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
}

export type BookCategory = "Sci-Fi" | "Fantasy" | "Drama" | "Business" | "Education" | "Geography";

export const BOOK_CATEGORIES: BookCategory[] = [
  "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography"
];

export interface BookListItem extends Pick<Book, "id" | "title" | "author" | "coverUrl" | "coverColor" | "category" | "rating"> {}
```

### Fase 2: Criar domain/repositories

```typescript
// src/domain/repositories/book.repository.ts
import { Book, BookCategory } from "../entities/book.entity";

export interface IBookRepository {
  getAll(category?: BookCategory, search?: string): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
  getFeatured(): Promise<Book[]>;
  search(query: string): Promise<Book[]>;
}
```

### Fase 3: Criar domain/usecases

```typescript
// src/domain/usecases/get-books.usecase.ts
import { Book, BookCategory } from "../entities/book.entity";
import { IBookRepository } from "../repositories/book.repository";

export class GetBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(options: { category?: BookCategory; search?: string; page?: number }) {
    const { category, search, page = 1 } = options;
    return this.bookRepository.getAll(category, search);
  }
}
```

### Fase 4: Criar infrastructure/database

```typescript
// src/infrastructure/database/supabase-book.repository.ts
import { IBookRepository } from "@/domain/repositories/book.repository";
import { Book, BookCategory } from "@/domain/entities/book.entity";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatBook } from "./mappers/book.mapper";

export class SupabaseBookRepository implements IBookRepository {
  async getAll(category?: BookCategory, search?: string): Promise<Book[]> {
    let query = supabaseAdmin.from("books").select("*");
    
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);
    
    const { data } = await query;
    return data?.map(formatBook) ?? [];
  }
  // ...
}
```

### Fase 5: Migrar Server Actions para infrastructure/api

```typescript
// src/infrastructure/api/books.actions.ts
'use server'
import { GetBooksUseCase } from "@/domain/usecases/get-books.usecase";
import { SupabaseBookRepository } from "../database/supabase-book.repository";

const bookRepository = new SupabaseBookRepository();
const getBooksUseCase = new GetBooksUseCase(bookRepository);

export async function getBooksAction(params: { category?: string; search?: string }) {
  return getBooksUseCase.execute(params);
}
```

### Fase 6: Atualizar features

Atualizar imports para usar nova estrutura:

```typescript
// Antes
import { Book } from "@/features/book-dashboard/types/book.types";

// Depois
import { Book } from "@/domain/entities/book.entity";
```

---

## Resumo das Alterações

| Fase | Ação | Arquivos |
|------|------|----------|
| 1 | Criar `domain/entities/` | `book.entity.ts`, `user.entity.ts`, `reading.entity.ts` |
| 2 | Criar `domain/repositories/` | Interfaces `IBookRepository`, `IUserRepository` |
| 3 | Criar `domain/usecases/` | `GetBooksUseCase`, `FavoriteBookUseCase` |
| 4 | Criar `infrastructure/database/` | `SupabaseBookRepository`, mappers |
| 5 | Migrar Server Actions | `infrastructure/api/` |
| 6 | Atualizar imports | Todos os arquivos que usam tipos |

---

## Benefícios

1. **Testabilidade**: Casos de uso podem ser testados com mocks
2. **Acoplamento mínimo**: Features dependem apenas de domain/
3. **Mudança organizada**: Alterar DB não afeta UI
4. **Reutilização**: Mesmo use case em diferentes features

---

## Tempo Estimado

- Fase 1-3: 1 dia
- Fase 4-5: 1 dia  
- Fase 6: 0.5 dia

**Total: ~2.5 dias**

---

*Planejamento feito em modo read-only*
