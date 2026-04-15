"use client";

import { useCallback } from "react";
import { ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";
import {
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZES,
  getNextFontSize,
} from "@/features/reading/utils/reading-constants.utils";

type UseReadingControlsOptions = {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  onAutoScrollToggle: () => void;
};

type UseReadingControlsReturn = {
  decreaseFontSize: () => void;
  increaseFontSize: () => void;
  toggleTheme: () => void;
  canDecreaseFontSize: boolean;
  canIncreaseFontSize: boolean;
};

export function useReadingControls({
  fontSize,
  onFontSizeChange,
  readingMode,
  onReadingModeChange,
}: UseReadingControlsOptions): UseReadingControlsReturn {
  const decreaseFontSize = useCallback(() => {
    const nextSize = getNextFontSize(fontSize, "decrease");
    if (nextSize !== null) {
      onFontSizeChange(nextSize);
    }
  }, [fontSize, onFontSizeChange]);

  const increaseFontSize = useCallback(() => {
    const nextSize = getNextFontSize(fontSize, "increase");
    if (nextSize !== null) {
      onFontSizeChange(nextSize);
    }
  }, [fontSize, onFontSizeChange]);

  const toggleTheme = useCallback(() => {
    onReadingModeChange(readingMode === "default" ? "night" : "default");
  }, [readingMode, onReadingModeChange]);

  const canDecreaseFontSize = fontSize > MIN_FONT_SIZE;
  const canIncreaseFontSize = fontSize < MAX_FONT_SIZE;

  return {
    decreaseFontSize,
    increaseFontSize,
    toggleTheme,
    canDecreaseFontSize,
    canIncreaseFontSize,
  };
}

export { FONT_SIZES };
