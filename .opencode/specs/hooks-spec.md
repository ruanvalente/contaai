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

## 2. Hooks Compartilhados (src/shared/hooks/)

Os hooks listados abaixo estão em `src/shared/hooks/` e são reutilizáveis entre features:

### 2.1 useSidebar

```tsx
// src/shared/hooks/use-sidebar.ts
type UseSidebarReturn = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};
```

### 2.2 useHydrated

```tsx
// src/shared/hooks/use-hydrated.ts
type UseHydratedReturn = boolean;
```

### 2.3 useAuthRedirect

```tsx
// src/shared/hooks/use-auth-redirect.ts
type UseAuthRedirectReturn = {
  isRedirecting: boolean;
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
};
```

---

## 3. Hooks por Feature

### 3.1 Discovery

```
src/features/discovery/hooks/
├── use-category-filter.ts
├── use-category-icons.ts
├── use-discover.ts
├── use-favorites-search.ts
├── use-favorites.ts
└── use-search.ts
```

### 3.2 Library

```
src/features/library/hooks/
├── use-library-state.ts
├── use-library-tabs.ts
└── use-user-books.ts
```

### 3.3 Book Dashboard

```
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

### 3.4 Editor

```
src/features/editor/hooks/
├── use-book-editor.ts
├── use-editor-backup-interval.ts
├── use-editor-backup.ts
├── use-editor-publish.ts
└── use-editor-toolbar.ts
```

### 3.5 Reading

```
src/features/reading/hooks/
├── use-click-outside.ts
├── use-debounced-save.ts
├── use-escape-key.ts
├── use-lexical-renderer.ts
├── use-panel-toggle.ts
├── use-reading-controls.ts
├── use-reading-session.ts
└── use-reading-theme.ts
```

### 3.6 Outras Features

```
src/features/notifications/hooks/
├── use-action-toast.ts
└── use-notification.ts

src/features/profile/hooks/
└── use-profile-form.ts

src/features/public-books/hooks/
└── use-public-books.ts

src/features/author-follow/hooks/
├── use-author-follow-initialized.ts
└── use-author-follow.ts

src/features/session-library/hooks/
├── use-session-library.ts
└── use-session-sync.ts
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
