"use client";

import { useState, useEffect, useCallback } from "react";
import { UserBook } from "@/features/book-dashboard/types/user-book.types";
import { LibraryTab } from "./use-library-tabs";

type UseUserBooksOptions = {
  activeTab: LibraryTab;
  initialBooks?: UserBook[];
};

type UseUserBooksReturn = {
  books: UserBook[];
  loading: boolean;
  refetch: () => void;
};

export function useUserBooks({
  activeTab,
  initialBooks = [],
}: UseUserBooksOptions): UseUserBooksReturn {
  const [books, setBooks] = useState<UserBook[]>(initialBooks);
  const [loading, setLoading] = useState(!initialBooks.length);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const type =
        activeTab === "my-stories"
          ? "my-stories"
          : activeTab === "reading"
            ? "reading"
            : "completed";

      const response = await fetch(`/api/user-books?type=${type}`);

      if (!response.ok) {
        console.error("API error:", response.status);
        setBooks([]);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, loading, refetch: fetchBooks };
}
