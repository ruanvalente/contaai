"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingHeader } from "@/features/reading/ui/reading-header.ui";
import { ProgressBar } from "@/features/reading/ui/progress-bar.ui";
import { AuthorInfo } from "@/features/reading/ui/author-info.ui";
import { ReadingContent } from "@/features/reading/ui/reading-content.ui";
import { ReadingControlsPanel } from "./reading-controls-panel.widget";
import { ReadingSkeleton } from "@/features/reading/ui/reading-skeleton.ui";
import { BookMetadata } from "@/features/reading/ui/book-metadata.ui";
import { EmptyContentState } from "@/features/reading/ui/empty-content-state.ui";
import { useReadingSession } from "@/features/reading/hooks/use-reading-session";

type ReadingPageProps = {
  bookId: string;
  book: {
    title: string;
    author: string;
    coverUrl?: string;
    coverColor: string;
    content?: string;
    wordCount: number;
    authorAvatar?: string;
    publishedAt?: Date;
    createdAt: Date;
  };
};

export function ReadingPage({ bookId, book }: ReadingPageProps) {
  const router = useRouter();

  const {
    preferences,
    isLoaded,
    isProgressLoaded,
    progress,
    isSaving,
    scrollPercent,
    setFontSize,
    setReadingMode,
    toggleAutoScroll,
    restoreProgress,
  } = useReadingSession({ bookId });

  useEffect(() => {
    if (isProgressLoaded && progress && progress.currentPosition.scrollTop && progress.currentPosition.scrollTop > 0) {
      restoreProgress();
    }
  }, [isProgressLoaded, progress, restoreProgress]);

  const hasScrolled = useMemo(() => scrollPercent > 0, [scrollPercent]);
  const hasContent = useMemo(() => !!book.content, [book.content]);

  if (!isLoaded) {
    return <ReadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <ReadingHeader title={book.title} onBack={() => router.back()} />

      {hasScrolled && (
        <div className="sticky top-14.25 z-40 bg-white/95 backdrop-blur-sm border-b border-primary-100 px-4 py-2">
          <ProgressBar progress={scrollPercent} visible={hasScrolled} />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {book.title}
            </h1>
            <AuthorInfo
              authorName={book.author}
              authorAvatar={book.authorAvatar}
              publishedDate={book.publishedAt}
            />
          </div>

          <BookMetadata wordCount={book.wordCount} />
        </motion.div>

        {hasContent ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ReadingContent
              content={book.content!}
              fontSize={preferences.fontSize}
              readingMode={preferences.readingMode}
            />
          </motion.div>
        ) : (
          <EmptyContentState />
        )}
      </main>

      <ReadingControlsPanel
        fontSize={preferences.fontSize}
        onFontSizeChange={setFontSize}
        readingMode={preferences.readingMode}
        onReadingModeChange={setReadingMode}
        autoScroll={preferences.autoScroll}
        onAutoScrollToggle={toggleAutoScroll}
        isSaving={isSaving}
      />
    </div>
  );
}
