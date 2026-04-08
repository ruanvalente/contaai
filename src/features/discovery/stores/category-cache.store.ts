import { create } from 'zustand';
import { Book } from '@/features/book-dashboard/types/book.types';

interface CategoryCache {
  books: Book[];
  timestamp: number;
}

interface CategorySearchState {
  cache: Record<string, CategoryCache>;
  addToCache: (key: string, books: Book[]) => void;
  getFromCache: (key: string, maxAgeMs?: number) => Book[] | null;
  clearCache: () => void;
}

const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useCategoryCache = create<CategorySearchState>((set, get) => ({
  cache: {},

  addToCache: (key: string, books: Book[]) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          books,
          timestamp: Date.now(),
        },
      },
    }));
  },

  getFromCache: (key: string, maxAgeMs: number = DEFAULT_CACHE_MAX_AGE) => {
    const cached = get().cache[key];
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > maxAgeMs;
    
    if (isExpired) return null;
    
    return cached.books;
  },

  clearCache: () => set({ cache: {} }),
}));

export function generateCacheKey(category: string, search: string, tab: string): string {
  return `${category || 'all'}:${search || 'empty'}:${tab || 'all'}`;
}