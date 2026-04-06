import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CreateBookModalState = {
  isOpen: boolean;
  title: string;
  author: string;
  category: string;
  coverUrl: string | null;
  coverColor: string;
  isUploading: boolean;
  isCreating: boolean;
  error: string | null;
  
  open: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  setAuthor: (author: string) => void;
  setCategory: (category: string) => void;
  setCoverUrl: (url: string | null) => void;
  setCoverColor: (color: string) => void;
  setUploading: (uploading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialModalState = {
  isOpen: false,
  title: "",
  author: "",
  category: "Drama",
  coverUrl: null,
  coverColor: "#8B4513",
  isUploading: false,
  isCreating: false,
  error: null,
};

export const useCreateBookModalStore = create<CreateBookModalState>()(
  devtools(
    (set) => ({
      ...initialModalState,
      open: () => set({ isOpen: true }),
      close: () => set({ ...initialModalState, isOpen: false }),
      setTitle: (title) => set({ title }),
      setAuthor: (author) => set({ author }),
      setCategory: (category) => set({ category }),
      setCoverUrl: (coverUrl) => set({ coverUrl }),
      setCoverColor: (coverColor) => set({ coverColor }),
      setUploading: (isUploading) => set({ isUploading }),
      setCreating: (isCreating) => set({ isCreating }),
      setError: (error) => set({ error }),
      reset: () => set(initialModalState),
    }),
    { name: "create-book-modal" }
  )
);
