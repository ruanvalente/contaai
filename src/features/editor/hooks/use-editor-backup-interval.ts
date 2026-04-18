"use client";

import { useEffect, useRef } from "react";
import { useBookEditorStore } from "@/features/book-dashboard/store/book-editor.store";
import { useShallow } from "zustand/react/shallow";
import { useEditorBackup } from "@/shared/hooks";

export function useEditorBackupInterval(
  bookId: string,
  isInitialized: boolean,
  bookTitle?: string
) {
  const { content: storeContent, isDirty } = useBookEditorStore(
    useShallow((state) => ({
      content: state.content,
      isDirty: state.isDirty,
    }))
  );

  const { saveBackup } = useEditorBackup({
    bookId,
    enabled: !!bookId,
  });

  const lastSavedContentRef = useRef<string>("");

  useEffect(() => {
    if (!bookId || !isInitialized) return;

    const interval = setInterval(() => {
      const currentContent = useBookEditorStore.getState().content;
      if (
        currentContent &&
        currentContent.length > 0 &&
        currentContent !== lastSavedContentRef.current
      ) {
        saveBackup(currentContent, bookTitle);
        lastSavedContentRef.current = currentContent;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bookId, isInitialized, saveBackup, bookTitle]);

  useEffect(() => {
    if (!bookId || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      const currentContent = useBookEditorStore.getState().content;
      if (currentContent && currentContent.length > 0) {
        saveBackup(currentContent, bookTitle);
        lastSavedContentRef.current = currentContent;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [bookId, isDirty, saveBackup, bookTitle]);
}
