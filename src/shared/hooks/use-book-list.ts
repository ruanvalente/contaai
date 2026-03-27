"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book } from "@/features/book-dashboard/types/book.types";
import {
  searchBooksAction,
  getBooksByCategoryAction,
} from "@/features/book-dashboard/actions/books.actions";

type UseBookListOptions = {
  initialBooks: Book[];
  initialPage?: number;
  initialSearch?: string;
  pageSize?: number;
};

type UseBookListReturn = {
  books: Book[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
};

export function useBookList({
  initialBooks,
  initialPage = 1,
  initialSearch = "",
  pageSize = 10,
}: UseBookListOptions): UseBookListReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || initialSearch,
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || initialPage.toString(), 10),
  );

  const handleSearch = useCallback(
    async (query: string, page: number) => {
      setIsLoading(true);
      try {
        let results: Book[];

        if (query.trim()) {
          results = await searchBooksAction(query);
        } else {
          results = initialBooks;
        }

        const totalPages = Math.ceil(results.length / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedResults = results.slice(
          startIndex,
          startIndex + pageSize,
        );

        setBooks(paginatedResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [initialBooks, pageSize],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery, currentPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, handleSearch]);

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleSetPage = (page: number) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return {
    books,
    isLoading,
    searchQuery,
    currentPage,
    totalPages: Math.ceil(books.length / pageSize) || 1,
    setSearchQuery: handleSetSearchQuery,
    setPage: handleSetPage,
  };
}
