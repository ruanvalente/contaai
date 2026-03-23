"use client";

import { useState, useCallback, useMemo } from "react";

type UseSearchReturn = {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  hasQuery: boolean;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQueryState] = useState(initialQuery);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState("");
  }, []);

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

  return {
    query,
    setQuery,
    clearQuery,
    hasQuery,
  };
}
