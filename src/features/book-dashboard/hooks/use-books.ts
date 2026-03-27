"use client";

import { useState, useCallback, useEffect } from "react";
import { Book, Category } from "../types/book.types";
import { filterBooksByCategory, searchBooks } from "../data/books";

type UseBooksReturn = {
  books: Book[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  filteredBooks: (category: Category, searchQuery?: string) => Book[];
}

export function useBooks(initialBooks?: Book[]): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>(initialBooks ?? []);
  const [isLoading, setIsLoading] = useState(!initialBooks);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (!initialBooks) {
      fetchBooks();
    }
  }, [initialBooks, fetchBooks]);

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
