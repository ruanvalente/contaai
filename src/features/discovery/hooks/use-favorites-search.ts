"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book } from "@/domain/entities/book.entity";
import { searchBooksAction } from "@/infrastructure/api/books.actions";

type UseFavoritesSearchOptions = {
  initialBooks?: Book[];
};

type UseFavoritesSearchReturn = {
  books: Book[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
};

export function useFavoritesSearch({ initialBooks = [] }: UseFavoritesSearchOptions = {}): UseFavoritesSearchReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQueryState] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      if (query.trim()) {
        const results = await searchBooksAction(query);
        setBooks(results);
      } else {
        setBooks(initialBooks);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialBooks]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return {
    books,
    isLoading,
    searchQuery,
    currentPage,
    setSearchQuery,
    setPage,
  };
}
