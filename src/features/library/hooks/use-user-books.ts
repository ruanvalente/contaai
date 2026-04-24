"use client";

import { useCallback, useEffect, useRef } from "react";
import { UserBook } from "@/server/domain/entities/user-book.entity";
import type { LibraryTab } from "./use-library-tabs";
import {
  getUserBooksAction,
  UserBookFilter,
} from "@/features/library/actions/user-books.actions";
import {
  useUserBooksStore,
  addBook as addBookToStoreFn,
  addBook,
  removeBook,
  updateBook,
} from "@/shared/store/user-books.store";

type UseUserBooksOptions = {
  activeTab?: LibraryTab;
  initialBooks?: UserBook[];
};

type UseUserBooksReturn = {
  books: UserBook[];
  loading: boolean;
  refetch: () => void;
};

export function useUserBooks({
  activeTab,
}: UseUserBooksOptions): UseUserBooksReturn {
  const tab = activeTab || "my-stories";

  const storeBooks = useUserBooksStore((state) => state.books);
  const isLoading = useUserBooksStore((state) => state.isLoading);
  const setInitialBooks = useUserBooksStore((state) => state.setInitialBooks);
  const setLoading = useUserBooksStore((state) => state.setLoading);

  const initialRender = useRef(true);

  const mapTabToFilter = (t: LibraryTab): UserBookFilter => {
    if (t === "my-stories") return "my-stories";
    if (t === "reading") return "reading";
    return "completed";
  };

  const filter = mapTabToFilter(tab);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserBooksAction(filter);
      setInitialBooks(data, filter);
    } catch (err) {
      console.error("Error fetching books:", err);
      setInitialBooks([], filter);
    } finally {
      setLoading(false);
    }
  }, [filter, setInitialBooks, setLoading]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      fetchBooks();
    }
  }, [fetchBooks]);

  const refetch = useCallback(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books: storeBooks,
    loading: isLoading,
    refetch,
  };
}

export function addBookToStore(book: UserBook) {
  addBookToStoreFn(book);
}

export { useUserBooksStore };