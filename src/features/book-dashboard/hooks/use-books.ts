"use client";

import { useState, useCallback } from "react";
import { Book, Category } from "../types/book.types";
import { mockBooks, filterBooksByCategory, searchBooks } from "../data/books";

type UseBooksReturn = {
  books: Book[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  filteredBooks: (category: Category, searchQuery?: string) => Book[];
}

export function useBooks(initialBooks?: Book[]): UseBooksReturn {
  const [books] = useState<Book[]>(initialBooks ?? mockBooks);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
  }, []);

  const filteredBooks = useCallback(
    (category: Category, searchQuery?: string): Book[] => {
      let result = filterBooksByCategory(books, category);

      if (searchQuery && searchQuery.trim()) {
        result = searchBooks(result, searchQuery);
      }

      return result;
    },
    [books],
  );

  return {
    books,
    isLoading,
    error,
    refetch,
    filteredBooks,
  };
}
