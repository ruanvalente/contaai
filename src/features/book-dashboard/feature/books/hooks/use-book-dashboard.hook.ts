"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/domain/entities/book.entity";

export function useBookDashboard(books: Book[] = []): {
  books: Book[];
  recommendedBooks: Book[];
  filteredBooks: Book[];
  selectedBook: Book | null;
  isSearchActive: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleBookSelect: (book: Book) => void;
  handleClearSelection: () => void;
  handleLogin: () => void;
} {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const hasQuery = query.trim().length > 0;

  const recommendedBooks = useMemo(() => {
    return books.slice(0, 6);
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (!hasQuery) return books;
    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.category.toLowerCase().includes(lowerQuery)
    );
  }, [books, query, hasQuery]);

  const handleBookSelect = useCallback((book: Book) => {
    setSelectedBook(book);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBook(null);
  }, []);

  const handleLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  return {
    books,
    recommendedBooks,
    filteredBooks,
    selectedBook,
    isSearchActive: hasQuery,
    query,
    setQuery,
    handleBookSelect,
    handleClearSelection,
    handleLogin,
  };
}
