"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollProgress } from "./use-scroll-progress";
import { useDebouncedSave } from "./use-debounced-save";
import { useReadingTheme } from "./use-reading-theme";
import { getReadingProgress, saveReadingProgress } from "@/features/reading/actions";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { ReadingProgress } from "@/features/reading/types/reading.types";

type UseReadingSessionOptions = {
  bookId: string;
  onProgressLoaded?: (progress: ReadingProgress | null) => void;
};

type UseReadingSessionReturn = {
  preferences: ReturnType<typeof useReadingTheme>["preferences"];
  isLoaded: boolean;
  isProgressLoaded: boolean;
  progress: ReadingProgress | null;
  isSaving: boolean;
  scrollPercent: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  setFontSize: ReturnType<typeof useReadingTheme>["setFontSize"];
  setReadingMode: ReturnType<typeof useReadingTheme>["setReadingMode"];
  toggleAutoScroll: ReturnType<typeof useReadingTheme>["toggleAutoScroll"];
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
        const userId = await getCurrentUserId();
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
      window.scrollTo({ top: progress.scrollTop, behavior: "instant" });
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

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  } catch {
    return null;
  }
}
