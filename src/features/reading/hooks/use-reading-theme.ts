"use client";

import { useReadingPreferences, type ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";

export { type ReadingMode };

export function useReadingTheme() {
  const readingPrefs = useReadingPreferences();

  return readingPrefs;
}
