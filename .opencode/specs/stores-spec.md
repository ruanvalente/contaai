# Stores Specification

## Description
Este documento define a especificação para stores de estado global usando Zustand na aplicação Conta.AI.

## Baseado em
- Zustand patterns
- Projeto: `src/shared/store/`

---

## 1. Padrão de Store Zustand

### Estrutura de Arquivo

```
src/shared/store/
├── example.store.ts        # Store com extensão .store.ts
├── example.types.ts        # Tipos (se necessário)
└── index.ts               # Barrel exports
```

### Template

```tsx
import { create } from "zustand";

type ExampleStore = {
  // State
  items: string[];
  isLoading: boolean;
  
  // Actions
  setItems: (items: string[]) => void;
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  setLoading: (loading: boolean) => void;
};

export const useExampleStore = create<ExampleStore>((set) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (item) =>
    set((state) => ({
      items: state.items.filter((i) => i !== item),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
```

---

## 2. Stores Existentes

### 2.1 Favorites Store

```tsx
// src/shared/store/favorites.store.ts
type FavoritesStore = {
  favoritedIds: Set<string>;
  isLoaded: boolean;
  isLoading: boolean;
  
  setInitialFavorites: (ids: string[]) => void;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  toggleFavorite: (bookId: string) => void;
  isFavorited: (bookId: string) => boolean;
  setLoading: (loading: boolean) => void;
  setLoaded: (loaded: boolean) => void;
};
```

**Padrão usado:**

```tsx
addFavorite: (bookId: string) => {
  set((state) => {
    const newSet = new Set(state.favoritedIds);
    newSet.add(bookId);
    return { favoritedIds: newSet };
  });
},

isFavorited: (bookId: string) => {
  return get().favoritedIds.has(bookId);
}
```

### 2.2 Sidebar Store

```tsx
// src/shared/store/sidebar.store.ts
type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};
```

### 2.3 Search Store

```tsx
// src/shared/store/search.store.ts
type SearchStore = {
  query: string;
  isSearching: boolean;
  results: SearchResult[];
  
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearch: () => void;
};
```

### 2.4 Pagination Cache Store

```tsx
// src/shared/store/pagination-cache.store.ts
type PaginationCacheStore = {
  caches: Record<string, {
    items: unknown[];
    total: number;
    page: number;
    hasMore: boolean;
  }>;
  
  getCache: (key: string) => unknown;
  setCache: (key: string, data: CacheData) => void;
  clearCache: (key: string) => void;
  clearAll: () => void;
};
```

### 2.5 Category Cache Store

```tsx
// src/shared/store/category-cache.store.ts
type CategoryCacheStore = {
  caches: Record<string, Book[]>;
  
  getCache: (category: string) => Book[] | undefined;
  setCache: (category: string, books: Book[]) => void;
  invalidateCache: (category?: string) => void;
};
```

---

## 3. Stores em Features

### 3.1 Book Editor Store

```tsx
// src/features/book-dashboard/store/book-editor.store.ts
type BookEditorStore = {
  // State
  title: string;
  author: string;
  content: string;
  category: Category;
  coverColor: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setTitle: (title: string) => void;
  setAuthor: (author: string) => void;
  setContent: (content: string) => void;
  setCategory: (category: Category) => void;
  setCoverColor: (color: string) => void;
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  reset: () => void;
};
```

---

## 4. Padrões de Store

### 4.1 Set State Imutável

```tsx
// ✅ Usar função set com callback para estado anterior
addItem: (item) =>
  set((state) => ({
    items: [...state.items, item],
  })),

// ❌ Não fazer mutação direta
addItem: (item) => {
  const state = get();
  state.items.push(item); // Mutação!
  set(state);
}
```

### 4.2 Seletores Eficientes

```tsx
// ✅ Seletor individual (re-renderiza apenas quando muda)
const count = useStore((state) => state.count);

// ✅ Seletor com objeto
const { count, name } = useStore((state) => ({
  count: state.count,
  name: state.name,
}));

// ⚠️ Cuidado - objeto sempre é novo reference
// Pode causar re-renders desnecessários
const partial = useStore((state) => {
  return { count: state.count }; // Sempre novo objeto!
});
```

### 4.3 Store com Getters

```tsx
// Zustand não tem getters nativos, usar selector
type StoreWithGetters = {
  items: string[];
  count: number;
  getItem: (index: number) => string | undefined;
};

export const useStore = create<StoreWithGetters>((set, get) => ({
  items: [],
  count: 0,
  
  getItem: (index) => get().items[index],
}));
```

### 4.4 Middleware Persist

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersistedStore = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const useThemeStore = create<PersistedStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage", // nome no localStorage
    }
  )
);
```

---

## 5. Boas Práticas

### 5.1 Quando Usar Store

```tsx
// ✅ USAR: Estado global compartilhado entre componentes
// - Tema da aplicação
// - Sidebar open/close
// - Favoritos do usuário
// - Dados de autenticação

// ❌ NÃO USAR: Estado local de componente
// - Form input value
// - Modal open/close (local)
// - Loading states locais
```

### 5.2 Nomeação

```tsx
// ✅ Nomes descritivos com sufixo Store
export const useSidebarStore = create<SidebarStore>();
export const useFavoritesStore = create<FavoritesStore>();
export const useUserStore = create<UserStore>();

// ❌ Nomes vagos
export const useStore = create();
export const useData = create();
```

### 5.3 Tipagem

```tsx
// ✅ Sempre criar tipo separado para clarity
type FavoritesStore = {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
};

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  removeItem: (item) => set((state) => ({ 
    items: state.items.filter(i => i !== item) 
  })),
}));
```

### 5.4 Acesso ao Estado Atual

```tsx
// ✅ Usar get() para ler estado atual
toggle: () => {
  const { isOpen } = get();
  set({ isOpen: !isOpen });
},

// ✅ Dentro de set com callback
increment: () => set((state) => ({ 
  count: state.count + 1 
})),
```

---

## 6. Integração com Server Actions

```tsx
// Store com integração de Server Actions
"use client";

import { create } from "zustand";

type BooksStore = {
  books: Book[];
  isLoading: boolean;
  fetchBooks: () => Promise<void>;
};

export const useBooksStore = create<BooksStore>((set) => ({
  books: [],
  isLoading: false,

  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const books = await getBooksAction();
      set({ books });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

---

## Acceptance Criteria

- [ ] Stores seguem extensão `.store.ts`
- [ ] Tipos definidos para estado e ações
- [ ] Mutação de estado via `set((state) => ...)`
- [ ] Uso de `get()` para acesso ao estado atual quando necessário
- [ ] Seletores específicos para evitar re-renders
- [ ] Store usada apenas para estado global
- [ ] Estado local usa useState
