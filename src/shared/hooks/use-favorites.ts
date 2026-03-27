"use client";

import { useState, useCallback, useEffect } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";
import { addToFavorites, removeFromFavorites } from "@/features/book-dashboard/actions/user-favorites.actions";

type UseFavoritesOptions = {
  initialFavoritedIds?: string[];
};

type UseFavoritesReturn = {
  favoritedIds: string[];
  isLoading: boolean;
  addFavorite: (book: Book) => Promise<void>;
  removeFavorite: (bookId: string) => Promise<void>;
  toggleFavorite: (book: Book) => Promise<void>;
  isFavorited: (bookId: string) => boolean;
};

export function useFavorites({ initialFavoritedIds = [] }: UseFavoritesOptions = {}): UseFavoritesReturn {
  const [favoritedIds, setFavoritedIds] = useState<string[]>(initialFavoritedIds);
  const [isLoading, setIsLoading] = useState(false);

  const addFavorite = useCallback(async (book: Book) => {
    setIsLoading(true);
    try {
      await addToFavorites(
        book.id,
        book.title,
        book.author,
        book.coverColor,
        book.coverUrl,
        book.category
      );
      setFavoritedIds((prev) => {
        if (!prev.includes(book.id)) {
          return [...prev, book.id];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFavorite = useCallback(async (bookId: string) => {
    setIsLoading(true);
    try {
      await removeFromFavorites(bookId);
      setFavoritedIds((prev) => prev.filter((id) => id !== bookId));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (book: Book) => {
    if (favoritedIds.includes(book.id)) {
      await removeFavorite(book.id);
    } else {
      await addFavorite(book);
    }
  }, [favoritedIds, addFavorite, removeFavorite]);

  const isFavorited = useCallback(
    (bookId: string) => favoritedIds.includes(bookId),
    [favoritedIds]
  );

  return {
    favoritedIds,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };
}
