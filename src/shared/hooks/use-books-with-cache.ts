"use client";

import { useMemo, useEffect } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";
import {
  usePaginationCache,
  generatePaginationKey,
} from "@/shared/store/pagination-cache.store";

type PaginationState = {
  currentPage: number;
  totalPages: number;
  total: number;
};

type UseBooksWithCacheOptions = {
  initialBooks: Book[];
  initialPagination?: PaginationState;
  serverPagination?: PaginationState;
  category: string | null;
  search: string;
  page: number;
};

type UseBooksWithCacheReturn = {
  books: Book[];
  pagination: PaginationState;
  isLoading: boolean;
  isFromCache: boolean;
};

export function useBooksWithCache({
  initialBooks,
  initialPagination,
  serverPagination,
  category,
  search,
  page,
}: UseBooksWithCacheOptions): UseBooksWithCacheReturn {
  const { getPage, addPage } = usePaginationCache();
  const cacheKey = generatePaginationKey(category, search, page);
  const cached = getPage(cacheKey);

  const hasServerPagination = serverPagination !== undefined;
  const hasCache = cached !== null;

  useEffect(() => {
    if (!hasCache && hasServerPagination) {
      addPage(cacheKey, initialBooks, serverPagination);
    }
  }, [hasCache, hasServerPagination, cacheKey, initialBooks, serverPagination, addPage]);

  const books = hasCache ? cached.books : initialBooks;
  const pagination = hasCache
    ? cached.pagination
    : serverPagination || initialPagination || {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };

  return useMemo(
    () => ({
      books,
      pagination,
      isLoading: false,
      isFromCache: hasCache && !hasServerPagination,
    }),
    [books, pagination, hasCache, hasServerPagination],
  );
}
