"use client";

import { useMemo } from "react";
import { parseAndRenderLexical } from "@/features/reading/utils";
import { ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";

type UseLexicalRendererOptions = {
  content: string;
  readingMode: ReadingMode;
};

type UseLexicalRendererReturn = {
  renderedContent: string;
};

export function useLexicalRenderer({
  content,
  readingMode,
}: UseLexicalRendererOptions): UseLexicalRendererReturn {
  const renderedContent = useMemo(() => {
    const isNightMode = readingMode === "night";
    return parseAndRenderLexical(content, isNightMode);
  }, [content, readingMode]);

  return { renderedContent };
}
