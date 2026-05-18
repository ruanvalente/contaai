# Public Books Feature

Feature para exibição de livros públicos sem necessidade de autenticação.

## Funcionalidades

- Listagem de livros públicos (catálogo + user_books publicados)
- Busca de livros
- Livros em destaque
- Filtro por categoria
- Componentes reutilizáveis para integração em qualquer página

## Estrutura

```
src/features/public-books/
├── actions/           # Server Actions
│   └── public-books.actions.ts
├── hooks/             # Hooks customizados
│   └── use-public-books.ts
├── types/             # Tipos TypeScript
│   └── public-books.types.ts
├── ui/                # Componentes visuais (puros)
│   ├── public-book-grid.ui.tsx
│   └── category-filter.ui.tsx
├── widgets/           # Componentes com lógica
│   ├── public-books.widget.tsx
│   └── public-search.widget.tsx
└── index.ts           # Exports
```

## Uso

### Server Actions (sem autenticação necessária)

```typescript
import { 
  getPublicBooksAction,
  getFeaturedPublicBooksAction,
  getPublicBookByIdAction,
  searchPublicBooksAction
} from "@/features/public-books";

// Listar livros públicos com paginação
const result = await getPublicBooksAction({
  category: "Sci-Fi",
  search: "space",
  page: 1,
  limit: 20,
});

// Buscar livro por ID
const book = await getPublicBookByIdAction("book-uuid");

// Livros em destaque
const featured = await getFeaturedPublicBooksAction(10);

// Busca
const results = await searchPublicBooksAction("query");
```

### Widget: Lista de Livros

```typescript
import { PublicBooksWidget } from "@/features/public-books";

// Lista com filtros
<PublicBooksWidget 
  showFilters={true}
  showSearch={true}
  onSelectBook={(book) => router.push(`/book/${book.id}`)}
/>

// Livros em destaque
<PublicBooksWidget featured limit={5} />
```

### Widget: Busca

```typescript
import { PublicSearchWidget } from "@/features/public-books";

<PublicSearchWidget 
  placeholder="Buscar livros..."
  onSelect={(book) => console.log(book)}
/>
```

### Hook: usePublicBooks

```typescript
import { usePublicBooks } from "@/features/public-books/hooks/use-public-books";

function MyComponent() {
  const { books, isLoading, setFilters } = usePublicBooks();
  
  return (
    <div>
      <button onClick={() => setFilters({ category: "Fantasy" })}>
        Filtrar por Fantasia
      </button>
    </div>
  );
}
```

## Rotas Públicas

Adicione `/book/` ao `publicPaths` no `proxy.ts`:

```typescript
const publicPaths = [
  // ... existentes
  "/book/",  // Leitura pública de livros
];
```

## Banco de Dados

A feature utiliza:
- Tabela `books` (catálogo) - SELECT público
- Tabela `user_books` (publicados) - SELECT público via RLS

## Migrate

Para garantir RLS público na leitura de `user_books`:

```sql
-- Nova policy para leitura pública de livros publicados
CREATE POLICY "Public can view published books"
ON user_books FOR SELECT
USING (status = 'published');
```