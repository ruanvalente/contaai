"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooks } from "@/features/book-dashboard/hooks/use-books";
import { useSearch } from "@/shared/hooks/use-search";
import { Book } from "@/features/book-dashboard/types/book.types";
import { featuredBooks } from "@/features/book-dashboard/data/books";
import { DiscoverHookReturn } from "../types/discover.types";

export function useDiscover(): DiscoverHookReturn {
  const { books, isLoading } = useBooks();
  const { query, setQuery, hasQuery } = useSearch();
  const router = useRouter();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const recommendedBooks = useMemo(() => {
    if (books.length === 0) return featuredBooks;
    return books.slice(0, 6);
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (!hasQuery) return books;
    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.category.toLowerCase().includes(lowerQuery),
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
    isLoading,
    query,
    handleBookSelect,
    handleClearSelection,
    handleLogin,
    setQuery,
  };
}
