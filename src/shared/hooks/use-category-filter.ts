"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UseCategoryFilterReturn = {
  category: string | null;
  search: string;
  page: number;
  setCategory: (category: string | null) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
};

export function useCategoryFilter(): UseCategoryFilterReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const buildUrl = useCallback(
    (updates: { category?: string | null; search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if ("category" in updates && updates.category !== undefined) {
        if (updates.category === null) {
          params.delete("category");
        } else {
          params.set("category", updates.category);
        }
      }

      if ("search" in updates) {
        if (updates.search) {
          params.set("search", updates.search);
        } else {
          params.delete("search");
        }
      }

      if ("page" in updates && updates.page !== undefined) {
        params.set("page", updates.page.toString());
      }

      return `?${params.toString()}`;
    },
    [searchParams],
  );

  const setCategory = useCallback(
    (newCategory: string | null) => {
      const url = buildUrl({ category: newCategory, page: 1 });
      router.push(url);
    },
    [buildUrl, router],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      const url = buildUrl({ search: newSearch, page: 1 });
      router.push(url);
    },
    [buildUrl, router],
  );

  const setPage = useCallback(
    (newPage: number) => {
      const url = buildUrl({ page: newPage });
      router.push(url);
    },
    [buildUrl, router],
  );

  const clearFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  return useMemo(
    () => ({
      category,
      search,
      page,
      setCategory,
      setSearch,
      setPage,
      clearFilters,
    }),
    [category, search, page, setCategory, setSearch, setPage, clearFilters],
  );
}
