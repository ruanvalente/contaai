"use client";

import { useState, useEffect, useCallback } from "react";
import { UserBook } from "@/server/domain/entities/user-book.entity";
import { LibraryTab } from "./use-library-tabs";
import { getUserBooksAction, UserBookFilter } from "@/features/library/actions/user-books.actions";

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
      const type: UserBookFilter = 
        activeTab === "my-stories"
          ? "my-stories"
          : activeTab === "reading"
            ? "reading"
            : "completed";

      const data = await getUserBooksAction(type);
      setBooks(data);
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
