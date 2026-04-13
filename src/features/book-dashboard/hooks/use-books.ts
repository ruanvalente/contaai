"use client";

import { useState, useCallback, useEffect } from "react";
import { Book, Category } from "@/server/domain/entities/book.entity";
import { getBooksAction } from "@/features/discovery/actions/books.actions";

function filterBooksByCategory(books: Book[], category: string): Book[] {
  if (category === "All") return books;
  return books.filter((book) => book.category === category);
}

function searchBooks(books: Book[], query: string): Book[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return books;

  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(normalizedQuery) ||
      book.author.toLowerCase().includes(normalizedQuery) ||
      book.category.toLowerCase().includes(normalizedQuery)
  );
}

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
      const data = await getBooksAction();
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
