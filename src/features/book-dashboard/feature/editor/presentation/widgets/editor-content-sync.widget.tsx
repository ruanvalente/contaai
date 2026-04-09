"use client";

import { useEffect, useRef, memo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { useBookEditorStore } from "@/features/book-dashboard/store/book-editor.store";
import { useShallow } from "zustand/shallow";
import { saveContent } from "@/features/book-dashboard/editor/application/commands/save-content.command";

type EditorContentSyncProps = {
  onInitialized?: () => void;
}

export const EditorContentSync = memo(({ onInitialized }: EditorContentSyncProps) => {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const setContent = useBookEditorStore(useShallow((state) => state.setContent));

  useEffect(() => {
    let mounted = true;

    const listener = editor.registerUpdateListener(({ editorState }) => {
      if (!mounted) return;
      editorState.read(() => {
        const root = $getRoot();
        setContent(root.getTextContent());
      });
    });

    return () => {
      mounted = false;
      listener();
    };
  }, [editor, setContent]);

  useEffect(() => {
    const { content } = useBookEditorStore.getState();
    if (initializedRef.current) return;
    if (!content) {
      initializedRef.current = true;
      onInitialized?.();
      return;
    }

    initializedRef.current = true;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(content));
      root.append(paragraph);
    });
    onInitialized?.();
  }, [editor, onInitialized]);

  useEffect(() => {
    const { isDirty, bookId, content: savedContent } = useBookEditorStore.getState();
    if (!isDirty || !bookId || !savedContent) return;

    const timer = setTimeout(async () => {
      const state = useBookEditorStore.getState();
      if (state.isDirty && state.content === savedContent && state.bookId === bookId) {
        state.setSaving(true);
        const result = await saveContent(bookId, state.content);
        if (result.success) {
          state.markSaved();
        } else {
          state.setSaving(false);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null;
});

EditorContentSync.displayName = "EditorContentSync";