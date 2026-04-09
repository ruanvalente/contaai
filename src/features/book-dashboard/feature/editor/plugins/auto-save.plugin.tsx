"use client";

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useBookEditorStore } from "@/features/book-dashboard/store/book-editor.store";
import { useShallow } from "zustand/shallow";
import { saveContent as saveBookContent } from "@/features/book-dashboard/editor/application/commands/save-content.command";

export function AutoSavePlugin() {
  const [editor] = useLexicalComposerContext();
  const [lastContent, setLastContent] = useState<string | null>(null);

  const { bookId, isDirty, setSaving, markSaved } = useBookEditorStore(
    useShallow((state) => ({
      bookId: state.bookId,
      isDirty: state.isDirty,
      setSaving: state.setSaving,
      markSaved: state.markSaved,
    }))
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        if (textContent !== lastContent) {
          useBookEditorStore.getState().setContent(textContent);
          setLastContent(textContent);
        }
      });
    });
  }, [editor, lastContent]);

  useEffect(() => {
    if (!isDirty || !bookId || !lastContent) return;

    const timer = setTimeout(async () => {
      const currentContent = useBookEditorStore.getState().content;
      
      if (currentContent === lastContent) {
        setSaving(true);
        const result = await saveBookContent(bookId, currentContent);
        if (result.success) {
          markSaved();
        } else {
          setSaving(false);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDirty, bookId, lastContent, setSaving, markSaved]);

  return null;
}
