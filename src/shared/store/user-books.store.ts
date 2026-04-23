import { create } from "zustand";
import { UserBook } from "@/server/domain/entities/user-book.entity";
import type { UserBookFilter } from "@/features/library/actions/user-books.actions";

type UserBooksStore = {
  books: UserBook[];
  isLoaded: boolean;
  isLoading: boolean;
  currentFilter: UserBookFilter;
  setInitialBooks: (books: UserBook[], filter: UserBookFilter) => void;
  addBook: (book: UserBook) => void;
  removeBook: (bookId: string) => void;
  updateBook: (bookId: string, updates: Partial<UserBook>) => void;
  setFilter: (filter: UserBookFilter) => void;
  setLoading: (loading: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  clear: () => void;
};

export const useUserBooksStore = create<UserBooksStore>((set) => ({
  books: [],
  isLoaded: false,
  isLoading: false,
  currentFilter: "my-stories",

  setInitialBooks: (books, filter) => {
    set({ books, currentFilter: filter, isLoaded: true, isLoading: false });
  },

  addBook: (book) => {
    set((state) => ({ books: [book, ...state.books] }));
  },

  removeBook: (bookId) => {
    set((state) => ({
      books: state.books.filter((b) => b.id !== bookId),
    }));
  },

  updateBook: (bookId, updates) => {
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, ...updates } : b
      ),
    }));
  },

  setFilter: (filter) => set({ currentFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  clear: () => set({ books: [], isLoaded: false, isLoading: false }),
}));

export function addBook(book: UserBook) {
  useUserBooksStore.getState().addBook(book);
}

export function removeBook(bookId: string) {
  useUserBooksStore.getState().removeBook(bookId);
}

export function updateBook(bookId: string, updates: Partial<UserBook>) {
  useUserBooksStore.getState().updateBook(bookId, updates);
}