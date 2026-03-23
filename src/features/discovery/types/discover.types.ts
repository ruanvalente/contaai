import { Book } from "@/features/book-dashboard/types/book.types";

export type DiscoverState = {
  books: Book[];
  recommendedBooks: Book[];
  filteredBooks: Book[];
  selectedBook: Book | null;
  isSearchActive: boolean;
  isLoading: boolean;
  query: string;
}

export type DiscoverActions = {
  handleBookSelect: (book: Book) => void;
  handleClearSelection: () => void;
  handleLogin: () => void;
  setQuery: (query: string) => void;
}

export type DiscoverHookReturn = DiscoverState & DiscoverActions;
