"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";

type InitialContentPluginProps = {
  content: string;
  onInitialized?: () => void;
}

export function InitialContentPlugin({
  content,
  onInitialized,
}: InitialContentPluginProps) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
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
  }, [editor, content, onInitialized]);

  return null;
}
