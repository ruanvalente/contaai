import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BookEditorState {
  bookId: string | null;
  title: string;
  author: string;
  content: string;
  coverUrl: string | null;
  coverColor: string;
  category: string;
  status: "draft" | "published";
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
  error: string | null;
  
  setBookId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setAuthor: (author: string) => void;
  setContent: (content: string) => void;
  setCoverUrl: (url: string | null) => void;
  setCoverColor: (color: string) => void;
  setCategory: (category: string) => void;
  setStatus: (status: "draft" | "published") => void;
  setSaving: (isSaving: boolean) => void;
  setPublishing: (isPublishing: boolean) => void;
  setError: (error: string | null) => void;
  markSaved: () => void;
  reset: () => void;
  initialize: (data: {
    bookId: string;
    title: string;
    author: string;
    content?: string;
    coverUrl?: string;
    coverColor: string;
    category: string;
    status: "draft" | "published";
  }) => void;
}

const initialState = {
  bookId: null,
  title: "",
  author: "",
  content: "",
  coverUrl: null,
  coverColor: "#8B4513",
  category: "",
  status: "draft" as const,
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  lastSaved: null,
  error: null,
};

export const useBookEditorStore = create<BookEditorState>()(
  devtools(
    (set) => ({
      ...initialState,
      setBookId: (bookId) => set({ bookId }),
      setTitle: (title) => set({ title, isDirty: true }),
      setAuthor: (author) => set({ author, isDirty: true }),
      setContent: (content) => set({ content, isDirty: true }),
      setCoverUrl: (coverUrl) => set({ coverUrl, isDirty: true }),
      setCoverColor: (coverColor) => set({ coverColor, isDirty: true }),
      setCategory: (category) => set({ category, isDirty: true }),
      setStatus: (status) => set({ status }),
      setSaving: (isSaving) => set({ isSaving }),
      setPublishing: (isPublishing) => set({ isPublishing }),
      setError: (error) => set({ error }),
      markSaved: () => set({ isDirty: false, lastSaved: new Date(), isSaving: false }),
      reset: () => set(initialState),
      initialize: (data) =>
        set({
          bookId: data.bookId,
          title: data.title,
          author: data.author,
          content: data.content || "",
          coverUrl: data.coverUrl || null,
          coverColor: data.coverColor,
          category: data.category,
          status: data.status,
          isDirty: false,
          isSaving: false,
          isPublishing: false,
          lastSaved: null,
          error: null,
        }),
    }),
    { name: "book-editor" }
  )
);

interface CreateBookModalState {
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
