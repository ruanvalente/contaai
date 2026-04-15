import { create } from 'zustand';
import { Book } from '@/server/domain/entities/book.entity';

export type PaginationCache = {
  books: Book[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  timestamp: number;
};

type PaginationCacheState = {
  cache: Record<string, PaginationCache>;
  addPage: (key: string, books: Book[], pagination: PaginationCache['pagination']) => void;
  getPage: (key: string, maxAgeMs?: number) => PaginationCache | null;
  clearCache: () => void;
  clearPage: (key: string) => void;
};

const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000;

export const usePaginationCache = create<PaginationCacheState>((set, get) => ({
  cache: {},

  addPage: (key: string, books: Book[], pagination: PaginationCache['pagination']) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          books,
          pagination,
          timestamp: Date.now(),
        },
      },
    }));
  },

  getPage: (key: string, maxAgeMs: number = DEFAULT_CACHE_MAX_AGE) => {
    const cached = get().cache[key];

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > maxAgeMs;

    if (isExpired) return null;

    return cached;
  },

  clearCache: () => set({ cache: {} }),

  clearPage: (key: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    });
  },
}));

export function generatePaginationKey(category: string | null, search: string, page: number): string {
  const cat = category || 'all';
  const searchTerm = search || 'empty';
  return `${cat}:${searchTerm}:page-${page}`;
}