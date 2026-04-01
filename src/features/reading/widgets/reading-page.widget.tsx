"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingHeader } from "@/features/reading/ui/reading-header.ui";
import { ProgressBar } from "@/features/reading/ui/progress-bar.ui";
import { AuthorInfo } from "@/features/reading/ui/author-info.ui";
import { ReadingContent } from "@/features/reading/ui/reading-content.ui";
import { ReadingControlsPanel } from "./reading-controls-panel.widget";
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
    if (isProgressLoaded && progress && progress.scrollTop > 0) {
      restoreProgress();
    }
  }, [isProgressLoaded, progress, restoreProgress]);

  const handleBack = () => {
    router.back();
  };

  const hasScrolled = scrollPercent > 0;

  if (!isLoaded) {
    return <ReadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <ReadingHeader title={book.title} onBack={handleBack} />

      {hasScrolled && (
        <div className="sticky top-[57px] z-40 bg-white/95 backdrop-blur-sm border-b border-primary-100 px-4 py-2">
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

          <div className="mb-6 flex items-center justify-between text-sm text-gray-500">
            <span>{book.wordCount.toLocaleString("pt-BR")} palavras</span>
            <span>{Math.ceil(book.wordCount / 200)} min de leitura</span>
          </div>
        </motion.div>

        {book.content ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ReadingContent
              content={book.content}
              fontSize={preferences.fontSize}
              readingMode={preferences.readingMode}
            />
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">
              Este livro ainda não possui conteúdo.
            </p>
          </div>
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

function ReadingSkeleton() {
  return (
    <div className="min-h-screen bg-primary-50 animate-pulse">
      <div className="h-14 bg-white border-b border-primary-200" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-10 w-2/3 bg-primary-200 rounded-lg mb-4" />
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl mb-8">
          <div className="w-10 h-10 bg-primary-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-primary-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-primary-200 rounded" />
          <div className="h-4 w-5/6 bg-primary-200 rounded" />
          <div className="h-4 w-4/6 bg-primary-200 rounded" />
        </div>
      </div>
    </div>
  );
}
