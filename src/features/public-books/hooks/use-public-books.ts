"use client";

import { useState, useCallback } from "react";
import type { PublicBookListItem, PublicBooksFilters, PublicBooksResult } from "../types/public-books.types";
import { getPublicBooksAction } from "../actions/public-books.actions";

interface UsePublicBooksOptions {
  initialFilters?: PublicBooksFilters;
}

interface UsePublicBooksReturn {
  books: PublicBookListItem[];
  isLoading: boolean;
  error: Error | null;
  filters: PublicBooksFilters;
  result: PublicBooksResult | null;
  setFilters: (filters: PublicBooksFilters) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePublicBooks(options?: UsePublicBooksOptions): UsePublicBooksReturn {
  const [books, setBooks] = useState<PublicBookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<PublicBooksFilters>(
    options?.initialFilters || {}
  );
  const [result, setResult] = useState<PublicBooksResult | null>(null);

  const loadBooks = useCallback(async (currentFilters: PublicBooksFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getPublicBooksAction(currentFilters);
      setBooks(data.books);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load books"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback(
    (newFilters: PublicBooksFilters) => {
      setFiltersState(newFilters);
      loadBooks(newFilters);
    },
    [loadBooks]
  );

  const loadMore = useCallback(async () => {
    if (!result || isLoading || (filters.page ?? 1) >= result.totalPages) return;

    const nextPage = (filters.page ?? 1) + 1;
    const nextFilters = { ...filters, page: nextPage };

    try {
      const data = await getPublicBooksAction(nextFilters);
      setBooks((prev) => [...prev, ...data.books]);
      setResult(data);
      setFiltersState(nextFilters);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more books"));
    }
  }, [result, isLoading, filters]);

  const refresh = useCallback(async () => {
    await loadBooks(filters);
  }, [filters, loadBooks]);

  // Initial load
  useState(() => {
    if (books.length === 0) {
      loadBooks(filters);
    }
  });

  return {
    books,
    isLoading,
    error,
    filters,
    result,
    setFilters,
    loadMore,
    refresh,
  };
}