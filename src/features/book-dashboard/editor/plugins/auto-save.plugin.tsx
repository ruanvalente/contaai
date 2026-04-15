"use client";

import { useEffect, useRef } from "react";
import { useBookEditorStore } from "@/features/book-dashboard/store/book-editor.store";
import { useShallow } from "zustand/shallow";
import { saveBookContent } from "@/features/book-dashboard/actions/user-books.actions";

export function AutoSavePlugin() {
  const lastSavedRef = useRef<string>("");
  const savingRef = useRef(false);

  const { bookId, isDirty, setSaving, markSaved, content } = useBookEditorStore(
    useShallow((state) => ({
      bookId: state.bookId,
      isDirty: state.isDirty,
      setSaving: state.setSaving,
      markSaved: state.markSaved,
      content: state.content,
    }))
  );

  useEffect(() => {
    if (!isDirty || !bookId || !content || content === lastSavedRef.current || savingRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      const currentContent = useBookEditorStore.getState().content;
      
      if (currentContent === lastSavedRef.current || savingRef.current) {
        savingRef.current = false;
        return;
      }

      savingRef.current = true;
      setSaving(true);
      
      const result = await saveBookContent(bookId, currentContent);
      
      if (result.success) {
        lastSavedRef.current = currentContent;
        markSaved();
      } else {
        setSaving(false);
      }
      savingRef.current = false;
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDirty, bookId, content, setSaving, markSaved]);

  return null;
}
