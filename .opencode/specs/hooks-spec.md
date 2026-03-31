# Hooks Specification

## Description
Este documento define a especificação para hooks customizados na aplicação Conta.AI. Hooks são funções reutilizáveis que encapsulam lógica de estado e side effects.

## Baseado em
- Padrões da aplicação atual (`src/shared/hooks/`)
- React Hooks Best Practices

---

## 1. Padrão de Hook Customizado

### Estrutura de Arquivo

```
src/shared/hooks/
├── use-example.ts           # Hook com extensão use-*.ts
├── use-example.spec.ts      # Testes (opcional)
└── index.ts                # Barrel exports
```

### Template

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";

type UseExampleOptions = {
  initialValue?: string;
  debounceMs?: number;
};

type UseExampleReturn = {
  value: string;
  setValue: (value: string) => void;
  isLoading: boolean;
};

export function useExample(
  options: UseExampleOptions = {}
): UseExampleReturn {
  const { initialValue = "", debounceMs = 0 } = options;
  
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Callback memoizado
  const handleSetValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return {
    value,
    setValue: handleSetValue,
    isLoading,
  };
}
```

---

## 2. Hooks Existentes

### 2.1 useFavorites

```tsx
// src/shared/hooks/use-favorites.ts
type UseFavoritesOptions = {
  initialFavoritedIds?: string[];
};

type UseFavoritesReturn = {
  favoritedIds: string[];
  isLoading: boolean;
  isLoaded: boolean;
  addFavorite: (book: Book) => Promise<void>;
  removeFavorite: (bookId: string) => Promise<void>;
  toggleFavorite: (book: Book) => Promise<void>;
  isFavorited: (bookId: string) => boolean;
};
```

### 2.2 useFavoritesSearch

```tsx
// src/shared/hooks/use-favorites-search.ts
type UseFavoritesSearchReturn = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFavorites: UserFavorite[];
  isSearching: boolean;
};
```

### 2.3 useCategoryFilter

```tsx
// src/shared/hooks/use-category-filter.ts
type UseCategoryFilterReturn = {
  selectedCategory: Category | "All";
  setCategory: (category: Category | "All") => void;
  filteredBooks: Book[];
};
```

### 2.4 useCategoryIcons

```tsx
// src/shared/hooks/use-category-icons.ts
type UseCategoryIconsReturn = {
  getIcon: (category: Category) => React.ReactNode;
  getColor: (category: Category) => string;
};
```

### 2.5 useLibraryState

```tsx
// src/shared/hooks/use-library-state.ts
type UseLibraryStateReturn = {
  activeTab: "all" | "reading" | "completed";
  setActiveTab: (tab: "all" | "reading" | "completed") => void;
};
```

### 2.6 useLibraryTabs

```tsx
// src/shared/hooks/use-library-tabs.ts
type UseLibraryTabsReturn = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
};
```

### 2.7 useSearch

```tsx
// src/shared/hooks/use-search.ts
type UseSearchOptions = {
  debounceMs?: number;
  minLength?: number;
};

type UseSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  debouncedQuery: string;
};
```

### 2.8 useSidebar

```tsx
// src/shared/hooks/use-sidebar.ts
type UseSidebarReturn = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};
```

### 2.9 useBookList

```tsx
// src/shared/hooks/use-book-list.ts
type UseBookListReturn = {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};
```

### 2.10 useBooksWithCache

```tsx
// src/shared/hooks/use-books-with-cache.ts
type UseBooksWithCacheOptions = {
  category?: Category | "All";
  cacheKey?: string;
};

type UseBooksWithCacheReturn = {
  books: Book[];
  isLoading: boolean;
  isCached: boolean;
};
```

### 2.11 useUserBooks

```tsx
// src/shared/hooks/use-user-books.ts
type UseUserBooksReturn = {
  myStories: UserBook[];
  reading: UserBook[];
  completed: UserBook[];
  isLoading: boolean;
};
```

### 2.12 useHydrated

```tsx
// src/shared/hooks/use-hydrated.ts
type UseHydratedReturn = boolean;
```

---

## 3. Hooks em Features

### 3.1 Book Dashboard Hooks

```
src/features/book-dashboard/hooks/
├── use-books.ts                  # Gestão de livros
├── use-book-dashboard.hook.ts    # Dashboard stats
├── use-categories.ts             # Categorias
├── use-selected-book.ts          # Livro selecionado
└── ...
```

### 3.2 Exemplo: useBooks

```tsx
// src/features/book-dashboard/hooks/use-books.ts
"use client";

import { useState, useEffect } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";
import { getBooksAction, searchBooksAction, getBooksByCategoryAction } from "../actions/books.actions";

export function useBooks(options: { 
  category?: string;
  search?: string;
} = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      setIsLoading(true);
      setError(null);
      
      try {
        let result: Book[];
        if (options.search) {
          result = await searchBooksAction(options.search);
        } else if (options.category && options.category !== "All") {
          result = await getBooksByCategoryAction(options.category);
        } else {
          result = await getBooksAction();
        }
        setBooks(result);
      } catch (err) {
        setError("Failed to load books");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, [options.category, options.search]);

  return { books, isLoading, error };
}
```

---

## 4. Padrões de Hook

### 4.1 Naming Convention

```tsx
// ✅ Sempre usar prefixo "use"
export function useUser() { }
export function useBooks() { }
export function useAuth() { }

// ❌ Não usar
export function getUser() { }
export function BookHelper() { }
```

### 4.2 Retorno Tipado

```tsx
// ✅ Sempre tipar retorno
type UseUserReturn = {
  user: User | null;
  isLoading: boolean;
};

export function useUser(): UseUserReturn { }

// ✅ Ou usar generics
export function useStateHook<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  return { value, setValue };
}
```

### 4.3 Opções como Primeiro Argumento

```tsx
// ✅ Opções como objeto
type UseFetchOptions = {
  debounceMs?: number;
  cache?: boolean;
  onError?: (error: Error) => void;
};

export function useFetch(url: string, options: UseFetchOptions) { }

// ❌ Múltiplos argumentos simples
export function useFetch(url: string, debounce: boolean, cache: boolean) { }
```

### 4.4 Memoização

```tsx
// useCallback para callbacks
const handleSearch = useCallback((query: string) => {
  setQuery(query);
}, []);

// useMemo para computações
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
}, [items, query]);
```

### 4.5 Diretiva "use client"

```tsx
// Hooks que usam outros hooks devem ser client components
"use client";

import { useState } from "react";

export function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}
```

---

## 5. Boas Práticas

### 5.1 Single Responsibility

```tsx
// ✅ Um hook faz uma coisa bem feita
export function useFavorites() { /* gerencia favoritos */ }
export function useSearch() { /* gerencia busca */ }

// ❌ Hook monolítico
export function useEverything() { 
  // favoritos + busca + autenticação + temas + etc
}
```

### 5.2 Composição

```tsx
// ✅ Compor hooks
function useFilteredFavorites() {
  const { favorites } = useFavorites();
  const { query, setQuery } = useSearch();
  
  return useMemo(() => {
    return favorites.filter(f => 
      f.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [favorites, query]);
}
```

### 5.3 Integração com Server Actions

```tsx
// hooks que chamam Server Actions
"use client";

import { useState, useEffect } from "react";
import { getBooksAction } from "@/features/book-dashboard/actions/books.actions";

export function useBooks() {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    getBooksAction().then(setBooks);
  }, []);
  
  return books;
}
```

---

## Acceptance Criteria

- [ ] Hooks seguem convenção `use-*.ts`
- [ ] Sempre começam com prefixo `use`
- [ ] São funções, não componentes
- [ ] Retorno tipado explicitamente
- [ ] Diretiva `"use client"` quando necessário
- [ ] Callbacks memoizados com `useCallback`
- [ ] Computações memoizadas com `useMemo`
- [ ] Single responsibility - um hook, uma responsabilidade
