"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "@/features/notifications";
import { Book } from "@/server/domain/entities/book.entity";
import { addToFavorites, removeFromFavorites, getUserFavorites } from "@/features/discovery/actions/favorites.actions";
import { useFavoritesStore } from "@/shared/store/favorites.store";
import { getAnonymousSessionId } from "@/shared/lib/anonymous-session";
import { useAuthStore } from "@/shared/storage/use-auth-store";

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
  const store = useFavoritesStore();
  const favoritedIds = Array.from(store.favoritedIds);

  const initialFavoritedIdsRef = useRef(initialFavoritedIds);

  useEffect(() => {
    initialFavoritedIdsRef.current = initialFavoritedIds;
  }, [initialFavoritedIds]);

  useEffect(() => {
    if (!store.isLoaded && initialFavoritedIdsRef.current.length > 0) {
      store.setInitialFavorites(initialFavoritedIdsRef.current);
    }
  }, [store.isLoaded, store.setInitialFavorites]);

  useEffect(() => {
    async function loadFavorites() {
      if (store.isLoaded) return;

      store.setLoading(true);
      try {
        const sessionId = getAnonymousSessionId();
        const favorites = await getUserFavorites(sessionId);
        const ids = favorites.map((f) => f.bookId);
        store.setInitialFavorites(ids);
      } finally {
        store.setLoading(false);
      }
    }
    loadFavorites();
  }, [store]);

  const addFavorite = useCallback(async (book: Book) => {
    const prevIds = store.favoritedIds; // snapshot for rollback

    store.addFavorite(book.id);

    try {
      const sessionId = getAnonymousSessionId();
      const result = await addToFavorites(book.id, sessionId);
      if (result.ok) {
        const user = useAuthStore.getState().user;
        if (user) {
          toast.success(`"${book.title}" adicionado aos favoritos`);
        } else {
          toast.success(`"${book.title}" favoritado! Faça login para acessar em outros dispositivos.`);
        }
      } else {
        store.setInitialFavorites(Array.from(prevIds));
        toast.error(result.error.message || "Erro ao adicionar aos favoritos");
      }
    } catch {
      store.setInitialFavorites(Array.from(prevIds));
      toast.error("Erro ao adicionar aos favoritos");
    }
  }, [store]);

  const removeFavorite = useCallback(async (bookId: string) => {
    const prevIds = store.favoritedIds;
    store.removeFavorite(bookId);

    try {
      const sessionId = getAnonymousSessionId();
      const result = await removeFromFavorites(bookId, sessionId);
      if (result.ok) {
        toast.success("Removido dos favoritos");
      } else {
        store.setInitialFavorites(Array.from(prevIds));
        toast.error(result.error.message || "Erro ao remover dos favoritos");
      }
    } catch {
      store.setInitialFavorites(Array.from(prevIds));
      toast.error("Erro ao remover dos favoritos");
    }
  }, [store]);

  const toggleFavorite = useCallback(async (book: Book) => {
    if (store.isFavorited(book.id)) {
      await removeFavorite(book.id);
    } else {
      await addFavorite(book);
    }
  }, [store, addFavorite, removeFavorite]);

  const isFavorited = useCallback(
    (bookId: string) => store.isFavorited(bookId),
    [store]
  );

  return {
    favoritedIds,
    isLoading: store.isLoading,
    isLoaded: store.isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };
}
