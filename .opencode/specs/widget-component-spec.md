# Widget Component Specification

## Description
Este documento define a especificação para componentes Widget na aplicação Conta.AI. Widgets são componentes que possuem lógica de negócio, estado interno, event handlers ou interagem com stores/ações.

## Baseado em
- Web Component Design Skill (`.agents/skills/wshobson-agents/plugins/ui-design/skills/web-component-design/`)
- Projeto: `src/shared/widgets/`

---

## 1. Padrão de Componente Widget

### Estrutura de Arquivo

```
src/shared/widgets/
├── book-grid.widget.tsx       # Componente com extensão .widget.tsx
├── book-grid.spec.tsx         # Testes
├── book-grid.types.ts        # Tipos específicos do widget
└── index.ts                  # Barrel exports
```

### Template

```tsx
"use client";

import { useState, useCallback } from "react";
import { BookGridUi } from "@/shared/ui/book-grid.ui";

type Book = {
  id: string;
  title: string;
};

type BookGridWidgetProps = {
  initialBooks?: Book[];
  onBookSelect?: (book: Book) => void;
};

export function BookGridWidget({ 
  initialBooks = [], 
  onBookSelect 
}: BookGridWidgetProps) {
  const [books, setBooks] = useState(initialBooks);
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback((book: Book) => {
    onBookSelect?.(book);
  }, [onBookSelect]);

  if (loading) {
    return <BookGridUi.Skeleton />;
  }

  return (
    <BookGridUi 
      books={books} 
      onSelect={handleSelect}
    />
  );
}
```

---

## 2. Widgets Existentes

### 2.1 Book Grid Widget

```tsx
// src/shared/widgets/book-grid.widget.tsx
type BookGridWidgetProps = {
  books: Book[];
  columns?: number;
  onBookClick?: (book: Book) => void;
  onFavoriteClick?: (book: Book) => void;
};
```

### 2.2 Category Filter Bar Widget

```tsx
// src/shared/widgets/category-filter-bar.widget.tsx
type CategoryFilterBarWidgetProps = {
  categories: Category[];
  activeCategory: Category | "All";
  onCategoryChange: (category: Category | "All") => void;
};
```

### 2.3 Dashboard Shell Widget

```tsx
// src/shared/widgets/dashboard-shell.widget.tsx
type DashboardShellWidgetProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};
```

### 2.4 Favorite Book Card Widget

```tsx
// src/shared/widgets/favorite-book-card.widget.tsx
type FavoriteBookCardWidgetProps = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor?: string;
  onRemove?: () => void;
};
```

### 2.5 Favorites Book List Widget

```tsx
// src/shared/widgets/favorites-book-list.widget.tsx
type FavoritesBookListWidgetProps = {
  favorites: UserFavorite[];
  onRemove?: (bookId: string) => void;
};
```

### 2.6 Library Tab Bar Widget

```tsx
// src/shared/widgets/library-tab-bar.widget.tsx
type LibraryTabBarWidgetProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};
```

### 2.7 User Dropdown Widget

```tsx
// src/shared/widgets/user-dropdown.widget.tsx
type UserDropdownWidgetProps = {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
  onProfileClick?: () => void;
};
```

---

## 3. Estrutura de Widgets em Features

### 3.1 Book Dashboard Widgets

```
src/features/book-dashboard/widgets/
├── book-details-modal.widget.tsx      # Modal de detalhes
├── book-details-panel.widget.tsx      # Painel lateral
├── book-editor.widget.tsx             # Editor de livro
├── book-editor-toolbar.tsx            # Toolbar do editor
├── categories-section.widget.tsx      # Seção de categorias
├── create-book-modal.widget.tsx       # Modal de criação
├── downloads-content.widget.tsx       # Conteúdo de downloads
├── favorites-content.widget.tsx       # Conteúdo de favoritos
├── library-content.widget.tsx         # Conteúdo da biblioteca
├── recommended-section.widget.tsx    # Seção de recomendados
└── search-results.widget.tsx          # Resultados de busca
```

### 3.2 Exemplo: Library Content Widget

```tsx
// src/features/book-dashboard/widgets/library-content.widget.tsx
"use client";

import { useMemo } from "react";
import { LibraryHeaderUi } from "@/shared/ui/library-header.ui";
import { LibraryTabBarWidget } from "@/shared/widgets/library-tab-bar.widget";
import { BookCardWidget } from "@/shared/widgets/book-card.widget";
import { EmptyLibraryStateUi } from "@/shared/ui/empty-library-state.ui";
import { useLibraryState } from "@/shared/hooks/use-library-state";
import { useUserBooks } from "@/shared/hooks/use-user-books";

export function LibraryContentWidget() {
  const { activeTab } = useLibraryState();
  const { myStories, reading, completed, isLoading } = useUserBooks();

  const filteredBooks = useMemo(() => {
    switch (activeTab) {
      case "reading":
        return reading;
      case "completed":
        return completed;
      default:
        return myStories;
    }
  }, [activeTab, myStories, reading, completed]);

  return (
    <div className="space-y-6">
      <LibraryHeaderUi title="My Library" />
      <LibraryTabBarWidget />
      {filteredBooks.length === 0 ? (
        <EmptyLibraryStateUi />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <BookCardWidget key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Padrões de Widget

### 4.1 Estado Local

```tsx
// useState para estado local
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

### 4.2 Handlers

```tsx
// Callbacks para ações
type WidgetProps = {
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
};
```

### 4.3 Loading States

```tsx
// Estados de loading
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Renderização condicional
if (loading) return <Skeleton />;
if (error) return <ErrorMessage message={error} />;
```

### 4.4 Integração com Stores

```tsx
// Zustand store
import { useFavoritesStore } from "@/shared/store/favorites.store";

export function FavoritesWidget() {
  const { favoritedIds, addFavorite, removeFavorite } = useFavoritesStore();
  // lógica...
}
```

### 4.5 Integração com Server Actions

```tsx
// Server Actions
import { addToFavorites, removeFromFavorites } from "@/features/book-dashboard/actions/user-favorites.actions";

export function FavoriteButtonWidget({ book }: { book: Book }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isFavorited) {
        await removeFromFavorites(book.id);
      } else {
        await addToFavorites(book.id, book.title, book.author);
      }
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleToggle} disabled={loading} />;
}
```

---

## 5. Boas Práticas

### 5.1 Separação UI/Widget

```tsx
// ❌ ERRADO - Widget fazendo tudo
export function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);
  
  return books.map(b => <div>{b.title}</div>);
}

// ✅ CORRETO - Separação clara
// widget.tsx - Lógica
export function BookListWidget() {
  const { books, loading } = useBooks();
  return <BookListUi books={books} loading={loading} />;
}

// ui.tsx - Apresentação
export function BookListUi({ books, loading }) {
  if (loading) return <Skeleton />;
  return books.map(b => <div>{b.title}</div>);
}
```

### 5.2 Hooks Customizados

```tsx
// Extrair lógica para hooks
// use-book-list.ts
export function useBookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // lógica de fetch...
  
  return { books, loading, refetch };
}

// widget.tsx
export function BookListWidget() {
  const { books, loading } = useBookList();
  return <BookListUi books={books} loading={loading} />;
}
```

### 5.3 Diretivas "use client"

```tsx
// Widgets sempre são Client Components
"use client";

import { useState } from "react";
// ...
```

---

## 6. Diferença UI vs Widget

| Aspecto | UI Component | Widget Component |
|---------|--------------|------------------|
| Estado | ❌ Não tem | ✅ Pode ter |
| Lógica | ❌ Apenas render | ✅ Lógica de negócio |
| "use client" | Opcional | ✅ Sempre |
| Extensão | `.ui.tsx` | `.widget.tsx` |
| Props | Apenas dados | Dados + callbacks |
| Stores | ❌ Não acessa | ✅ Pode acessar |
| Server Actions | ❌ Não chama | ✅ Pode chamar |

---

## Acceptance Criteria

- [ ] Widgets seguem extensão `.widget.tsx`
- [ ] Sempre usam diretiva `"use client"`
- [ ] Separação clara entre UI (presentacional) e Widget (lógica)
- [ ] Integração com stores Zustand quando necessário
- [ ] Integração com Server Actions para mutações
- [ ] Estados de loading e error tratados
- [ ] Callbacks seguem convenção `onAction`
- [ ] Usam hooks customizados para lógica reutilizável
