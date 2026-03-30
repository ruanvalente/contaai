"use client";

import { useCallback, useEffect, useRef } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";
import { addToFavorites, removeFromFavorites, getUserFavorites } from "@/features/book-dashboard/actions/user-favorites.actions";
import { useFavoritesStore } from "@/shared/store/favorites.store";

type UseFavoritesOptions = {
  initialFavoritedIds?: string[];
};

type UseFavoritesReturn = {
  favoritedIds: string[];
  isLoading: boolean;
  isLoaded: boolean;
  addFavorite: (book: Book) => Promise<void>;
  removeFavorite: (bookId: string) => Promise<void>;
  toggleFavorite: (book: Book) => Promise<void>;
  isFavorited: (bookId: string) => boolean;
};

export function useFavorites({ initialFavoritedIds = [] }: UseFavoritesOptions = {}): UseFavoritesReturn {
  const favoritedIds = useFavoritesStore((state) => state.favoritedIds);
  const isLoading = useFavoritesStore((state) => state.isLoading);
  const isLoaded = useFavoritesStore((state) => state.isLoaded);
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore((state) => state.removeFavorite);
  const isFavoritedFn = useFavoritesStore((state) => state.isFavorited);
  const setInitialFavorites = useFavoritesStore((state) => state.setInitialFavorites);
  const setLoading = useFavoritesStore((state) => state.setLoading);

  const initialFavoritedIdsRef = useRef(initialFavoritedIds);
  
  useEffect(() => {
    initialFavoritedIdsRef.current = initialFavoritedIds;
  }, [initialFavoritedIds]);

  useEffect(() => {
    if (!isLoaded && initialFavoritedIdsRef.current.length > 0) {
      setInitialFavorites(initialFavoritedIdsRef.current);
    }
  }, [isLoaded, setInitialFavorites]);

  useEffect(() => {
    async function loadFavorites() {
      if (isLoaded) return;
      
      setLoading(true);
      try {
        const favorites = await getUserFavorites();
        const ids = favorites.map((f) => f.bookId);
        setInitialFavorites(ids);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [isLoaded, setInitialFavorites, setLoading]);

  const addFavorite = useCallback(async (book: Book) => {
    setLoading(true);
    try {
      const result = await addToFavorites(
        book.id,
        book.title,
        book.author,
        book.coverColor,
        book.coverUrl,
        book.category
      );
      if (result.success) {
        addFavoriteToStore(book.id);
      }
    } finally {
      setLoading(false);
    }
  }, [addFavoriteToStore, setLoading]);

  const removeFavorite = useCallback(async (bookId: string) => {
    setLoading(true);
    try {
      const result = await removeFromFavorites(bookId);
      if (result.success) {
        removeFavoriteFromStore(bookId);
      }
    } finally {
      setLoading(false);
    }
  }, [removeFavoriteFromStore, setLoading]);

  const toggleFavorite = useCallback(async (book: Book) => {
    if (isFavoritedFn(book.id)) {
      await removeFavorite(book.id);
    } else {
      await addFavorite(book);
    }
  }, [isFavoritedFn, addFavorite, removeFavorite]);

  const isFavorited = useCallback(
    (bookId: string) => isFavoritedFn(bookId),
    [isFavoritedFn]
  );

  return {
    favoritedIds: Array.from(favoritedIds),
    isLoading,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };
}
