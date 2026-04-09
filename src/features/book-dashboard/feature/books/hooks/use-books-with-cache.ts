"use client";

import { useMemo } from "react";
import { Book } from "@/domain/entities/book.entity";
import {
  usePaginationCache,
  generatePaginationKey,
} from "@/features/discovery";

export type PaginationState = {
  currentPage: number;
  totalPages: number;
  total: number;
};

export function useBooksWithCache({
  initialBooks,
  category,
  search,
  page,
}: {
  initialBooks: Book[];
  category: string | null;
  search: string;
  page: number;
}): {
  books: Book[];
  pagination: PaginationState;
  isFromCache: boolean;
} {
  const { getPage, addPage } = usePaginationCache();
  const cacheKey = generatePaginationKey(category, search, page);
  const cached = getPage(cacheKey);

  const hasCache = cached !== null;

  useMemo(() => {
    if (!hasCache && initialBooks.length > 0) {
      addPage(cacheKey, initialBooks, {
        currentPage: page,
        totalPages: 1,
        total: initialBooks.length,
      });
    }
  }, [hasCache, cacheKey, initialBooks, page, addPage]);

  const books = hasCache ? cached.books : initialBooks;
  const pagination = useMemo(
    () =>
      hasCache && cached
        ? cached.pagination
        : {
            currentPage: page,
            totalPages: 1,
            total: initialBooks.length,
          },
    [hasCache, cached, page, initialBooks]
  );

  return useMemo(
    () => ({
      books,
      pagination,
      isFromCache: hasCache,
    }),
    [books, pagination, hasCache]
  );
}
