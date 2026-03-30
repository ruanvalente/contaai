import { create } from "zustand";

type FavoritesStore = {
  favoritedIds: Set<string>;
  isLoaded: boolean;
  isLoading: boolean;
  setInitialFavorites: (ids: string[]) => void;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  toggleFavorite: (bookId: string) => void;
  isFavorited: (bookId: string) => boolean;
  setLoading: (loading: boolean) => void;
  setLoaded: (loaded: boolean) => void;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoritedIds: new Set<string>(),
  isLoaded: false,
  isLoading: false,

  setInitialFavorites: (ids: string[]) => {
    set({ favoritedIds: new Set(ids), isLoaded: true });
  },

  addFavorite: (bookId: string) => {
    set((state) => {
      const newSet = new Set(state.favoritedIds);
      newSet.add(bookId);
      return { favoritedIds: newSet };
    });
  },

  removeFavorite: (bookId: string) => {
    set((state) => {
      const newSet = new Set(state.favoritedIds);
      newSet.delete(bookId);
      return { favoritedIds: newSet };
    });
  },

  toggleFavorite: (bookId: string) => {
    const { favoritedIds } = get();
    if (favoritedIds.has(bookId)) {
      get().removeFavorite(bookId);
    } else {
      get().addFavorite(bookId);
    }
  },

  isFavorited: (bookId: string) => {
    return get().favoritedIds.has(bookId);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
}));
