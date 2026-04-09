"use client";

import { useState } from "react";
import { Book } from "@/domain/entities/book.entity";

export function useBooks(initialBooks: Book[] = []): {
  books: Book[];
  setBooks: (books: Book[]) => void;
} {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  return {
    books,
    setBooks,
  };
}
