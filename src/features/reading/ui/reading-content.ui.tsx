"use client";

import { cn } from "@/utils/cn";
import { ReadingMode } from "@/features/reading/types/reading.types";
import { useLexicalRenderer } from "@/features/reading/hooks/use-lexical-renderer";

type ReadingContentProps = {
  content: string;
  fontSize: number;
  readingMode: ReadingMode;
  className?: string;
};

export function ReadingContent({
  content,
  fontSize,
  readingMode,
  className,
}: ReadingContentProps) {
  const { renderedContent } = useLexicalRenderer({
    content,
    readingMode,
  });

  const isNightMode = readingMode === "night";

  return (
    <div
      className={cn(
        "reading-content mx-auto max-w-170 px-4 sm:px-6 py-8 sm:py-12 rounded-xl",
        isNightMode ? "reading-mode-night" : "bg-white",
        className,
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 1.7,
      }}
    >
      <div className="prose prose-lg max-w-none font-serif">
        <div
          className="lexical-content"
          dangerouslySetInnerHTML={{
            __html: renderedContent,
          }}
        />
      </div>
    </div>
  );
}
