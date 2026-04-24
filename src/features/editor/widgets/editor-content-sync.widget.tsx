"use client";

import { useEffect, useRef, memo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { useBookEditorStore } from "../store/book-editor.store";
import { useShallow } from "zustand/react/shallow";

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
      const json = editorState.toJSON();
      setContent(JSON.stringify(json));
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
      
      try {
        const parsed = JSON.parse(content);
        if (parsed && parsed.root) {
          const editorState = editor.parseEditorState(content);
          editor.setEditorState(editorState);
        } else {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(content));
          root.append(paragraph);
        }
      } catch {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(content));
        root.append(paragraph);
      }
    });
    onInitialized?.();
  }, [editor, onInitialized]);

  useEffect(() => {
    const { isDirty, bookId, content: savedContent } = useBookEditorStore.getState();
    if (!isDirty || !bookId || !savedContent) return;

    const timer = setTimeout(async () => {
      const state = useBookEditorStore.getState();
      if (state.isDirty && state.content === savedContent && state.bookId === bookId) {
        const { saveBookContent } = await import(
          "@/features/book-dashboard/actions/user-books.actions"
        );
        state.setSaving(true);
        const result = await saveBookContent(bookId, state.content);
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