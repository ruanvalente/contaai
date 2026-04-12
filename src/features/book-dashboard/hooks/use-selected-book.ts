"use client";

import { useState, useCallback } from "react";
import { Book } from "@/server/domain/entities/book.entity";

type UseSelectedBookReturn = {
  selectedBook: Book | null;
  selectBook: (book: Book | null) => void;
  selectBookById: (bookId: string) => void;
  clearSelection: () => void;
}

export function useSelectedBook(books: Book[] = []): UseSelectedBookReturn {
  const [selectedBook, setSelectedBook] = useState<Book | null>(
    books.length > 0 ? books[0] : null
  );

  const selectBook = useCallback((book: Book | null) => {
    setSelectedBook(book);
  }, []);

  const selectBookById = useCallback(
    (bookId: string) => {
      const book = books.find((b) => b.id === bookId) || null;
      setSelectedBook(book);
    },
    [books]
  );

  const clearSelection = useCallback(() => {
    setSelectedBook(null);
  }, []);

  return {
    selectedBook,
    selectBook,
    selectBookById,
    clearSelection,
  };
}
