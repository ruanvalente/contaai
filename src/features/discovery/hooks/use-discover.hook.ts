"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooks } from "@/features/book-dashboard/hooks/use-books";
import { useSearch } from "@/features/discovery/hooks/use-search";
import { Book } from "@/domain/entities/book.entity";
import { DiscoverHookReturn } from "../types/discover.types";

type UseDiscoverProps = {
  initialBooks?: Book[];
}

export function useDiscover({ initialBooks = [] }: UseDiscoverProps = {}): DiscoverHookReturn {
  const { books: fetchedBooks, isLoading } = useBooks();
  const { query, setQuery, hasQuery } = useSearch();
  const router = useRouter();

  const books = initialBooks.length > 0 ? initialBooks : fetchedBooks;
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
    isLoading: initialBooks.length > 0 ? false : isLoading,
    query,
    handleBookSelect,
    handleClearSelection,
    handleLogin,
    setQuery,
  };
}
