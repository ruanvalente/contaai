import { create } from "zustand";
import { Book } from "@/server/domain/entities/book.entity";

type SearchCache = {
  [query: string]: Book[];
};

type SearchStore = {
  query: string;
  results: Book[];
  isSearching: boolean;
  cache: SearchCache;
  setQuery: (query: string) => void;
  setResults: (results: Book[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  getFromCache: (query: string) => Book[] | undefined;
  addToCache: (query: string, results: Book[]) => void;
  clearResults: () => void;
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: "",
  results: [],
  isSearching: false,
  cache: {},

  setQuery: (query) => set({ query }),

  setResults: (results) => set({ results }),

  setIsSearching: (isSearching) => set({ isSearching }),

  getFromCache: (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    return get().cache[normalizedQuery];
  },

  addToCache: (query, results) => {
    const normalizedQuery = query.toLowerCase().trim();
    set((state) => ({
      cache: {
        ...state.cache,
        [normalizedQuery]: results,
      },
    }));
  },

  clearResults: () => set({ results: [], query: "" }),
}));
