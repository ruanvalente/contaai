"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollProgress } from "./use-scroll-progress";
import { useDebouncedSave } from "./use-debounced-save";
import { useReadingTheme } from "./use-reading-theme";
import { getReadingProgress, saveReadingProgress } from "@/features/reading/actions";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { ReadingProgress, ReadingPreferences } from "@/features/reading/types/reading.types";
import { scrollToPosition } from "@/features/reading/utils";
import { getCurrentUserIdClient } from "@/utils/auth";

type UseReadingSessionOptions = {
  bookId: string;
  onProgressLoaded?: (progress: ReadingProgress | null) => void;
};

type UseReadingSessionReturn = {
  preferences: ReadingPreferences;
  isLoaded: boolean;
  isProgressLoaded: boolean;
  progress: ReadingProgress | null;
  isSaving: boolean;
  scrollPercent: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  setFontSize: (size: number) => void;
  setReadingMode: (mode: "default" | "night") => void;
  toggleAutoScroll: () => void;
  scrollToTop: () => void;
  scrollToPercent: (percent: number) => void;
  restoreProgress: () => void;
};

export function useReadingSession({
  bookId,
  onProgressLoaded,
}: UseReadingSessionOptions): UseReadingSessionReturn {
  const isHydrated = useHydrated();
  const theme = useReadingTheme();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  const handleSaveProgress = useCallback(
    async (data: { percent: number; scrollTop: number }) => {
      await saveReadingProgress(bookId, data.percent, data.scrollTop);
    },
    [bookId]
  );

  const { debouncedSave, isSaving } = useDebouncedSave(handleSaveProgress, 2000);

  const handleProgressChange = useCallback(
    (percent: number) => {
      const scrollTop = typeof window !== "undefined" ? window.scrollY : 0;
      debouncedSave({ percent, scrollTop });
    },
    [debouncedSave]
  );

  const { scrollPercent, isAtTop, isAtBottom, scrollToTop, scrollToPercent } =
    useScrollProgress({
      throttleMs: 200,
      onProgressChange: handleProgressChange,
    });

  useEffect(() => {
    async function loadProgress() {
      if (!isHydrated) return;

      try {
        const userId = await getCurrentUserIdClient();
        if (!userId) {
          setIsProgressLoaded(true);
          return;
        }

        const loadedProgress = await getReadingProgress(bookId, userId);
        setProgress(loadedProgress);
        onProgressLoaded?.(loadedProgress);
      } catch (err) {
        console.error("Error loading reading progress:", err);
      } finally {
        setIsProgressLoaded(true);
      }
    }

    loadProgress();
  }, [bookId, isHydrated, onProgressLoaded]);

  const restoreProgress = useCallback(() => {
    if (progress && progress.scrollTop > 0) {
      scrollToPosition(undefined, (progress.scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    }
  }, [progress]);

  return {
    preferences: theme.preferences,
    isLoaded: theme.isLoaded,
    isProgressLoaded,
    progress,
    isSaving,
    scrollPercent,
    isAtTop,
    isAtBottom,
    setFontSize: theme.setFontSize,
    setReadingMode: theme.setReadingMode,
    toggleAutoScroll: theme.toggleAutoScroll,
    scrollToTop,
    scrollToPercent,
    restoreProgress,
  };
}
