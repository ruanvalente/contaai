"use client";

import { useCallback } from "react";
import { useFavoritesStore } from "@/features/discovery";

type UseFavoritesReturn = {
  favoritedIds: Set<string>;
  isLoading: boolean;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  toggleFavorite: (bookId: string) => void;
  isFavorited: (bookId: string) => boolean;
};

export function useFavorites(): UseFavoritesReturn {
  const favoritedIds = useFavoritesStore((state) => state.favoritedIds);
  const isLoading = useFavoritesStore((state) => state.isLoading);
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore((state) => state.removeFavorite);
  const isFavoritedFn = useFavoritesStore((state) => state.isFavorited);

  const addFavorite = useCallback((bookId: string) => {
    addFavoriteToStore(bookId);
  }, [addFavoriteToStore]);

  const removeFavorite = useCallback((bookId: string) => {
    removeFavoriteFromStore(bookId);
  }, [removeFavoriteFromStore]);

  const toggleFavorite = useCallback((bookId: string) => {
    if (isFavoritedFn(bookId)) {
      removeFavoriteFromStore(bookId);
    } else {
      addFavoriteToStore(bookId);
    }
  }, [isFavoritedFn, addFavoriteToStore, removeFavoriteFromStore]);

  const isFavorited = useCallback(
    (bookId: string) => isFavoritedFn(bookId),
    [isFavoritedFn]
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
