"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookEditorStore } from "../store/book-editor.store";
import { useShallow } from "zustand/react/shallow";
import { getBookById } from "@/features/book-dashboard/actions/user-books.actions";
import { useEditorBackup } from "./use-editor-backup";

type BookData = {
  id: string;
  title: string;
  author: string;
  content: string;
  coverUrl?: string;
  coverColor: string;
  category: string;
  status: "draft" | "published";
  updatedAt?: Date;
};

type UseBookEditorReturn = {
  book: BookData | null;
  loading: boolean;
  isInitialized: boolean;
  showRecoveryModal: boolean;
  recoveredContent: string | null;
  hasBackup: boolean;
  backupData: { content: string; timestamp: number; title: string } | null;
  handleRecoverContent: () => Promise<void>;
  handleDiscardRecovery: () => void;
  handleBack: () => void;
};

export function useBookEditor(bookId: string): UseBookEditorReturn {
  const router = useRouter();
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveredContent, setRecoveredContent] = useState<string | null>(null);

  const { initialize, setContent } = useBookEditorStore(useShallow((state) => ({
    initialize: state.initialize,
    setContent: state.setContent,
  })));

  const { hasBackup, backupData, clearBackup } = useEditorBackup({
    bookId,
    enabled: !!bookId,
  });

  useEffect(() => {
    async function loadBook() {
      try {
        const bookData = await getBookById(bookId);
        if (bookData) {
          const dbContent = bookData.content || "";

          if (hasBackup && backupData) {
            const dbHasMoreContent = dbContent.trim().length > 0;
            const backupIsNewer =
              backupData.timestamp > (bookData.updatedAt?.getTime() || 0);

            if (dbHasMoreContent && backupIsNewer) {
              setBook({
                id: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: dbContent,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
                updatedAt: bookData.updatedAt,
              });
              initialize({
                bookId: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: dbContent,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
              });
              setShowRecoveryModal(true);
              setRecoveredContent(backupData.content);
            } else if (!dbHasMoreContent) {
              setBook({
                id: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: backupData.content,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
              });
              initialize({
                bookId: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: backupData.content,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
              });
              setIsInitialized(true);
              clearBackup();
            } else {
              setBook({
                id: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: dbContent,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
              });
              initialize({
                bookId: bookData.id,
                title: bookData.title,
                author: bookData.author,
                content: dbContent,
                coverUrl: bookData.coverUrl,
                coverColor: bookData.coverColor,
                category: bookData.category,
                status: bookData.status,
              });
              clearBackup();
            }
          } else {
            setBook({
              id: bookData.id,
              title: bookData.title,
              author: bookData.author,
              content: dbContent,
              coverUrl: bookData.coverUrl,
              coverColor: bookData.coverColor,
              category: bookData.category,
              status: bookData.status,
            });
            initialize({
              bookId: bookData.id,
              title: bookData.title,
              author: bookData.author,
              content: dbContent,
              coverUrl: bookData.coverUrl,
              coverColor: bookData.coverColor,
              category: bookData.category,
              status: bookData.status,
            });
          }
        } else {
          router.push("/dashboard/library");
        }
      } catch (err) {
        console.error("Error loading book:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId, router, initialize, hasBackup, backupData, clearBackup]);

  const handleRecoverContent = useCallback(async () => {
    if (recoveredContent) {
      if (book) {
        setBook({ ...book, content: recoveredContent });
      }
      setContent(recoveredContent);
      if (bookId) {
        const { saveBookContent } =
          await import("@/features/book-dashboard/actions/user-books.actions");
        await saveBookContent(bookId, recoveredContent);
        useBookEditorStore.getState().markSaved();
      }
      clearBackup();
      setShowRecoveryModal(false);
      setRecoveredContent(null);
    }
  }, [recoveredContent, book, setContent, bookId, clearBackup]);

  const handleDiscardRecovery = useCallback(() => {
    clearBackup();
    setShowRecoveryModal(false);
    setRecoveredContent(null);
  }, [clearBackup]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/library");
  }, [router]);

  return {
    book,
    loading,
    isInitialized,
    showRecoveryModal,
    recoveredContent,
    hasBackup,
    backupData,
    handleRecoverContent,
    handleDiscardRecovery,
    handleBack,
  };
}
