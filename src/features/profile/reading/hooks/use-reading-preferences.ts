"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export type ReadingMode = "default" | "night";

export type ReadingPreferences = {
  fontSize: number;
  readingMode: ReadingMode;
  autoScroll: boolean;
};

const STORAGE_KEY = "reading-preferences";

const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontSize: 16,
  readingMode: "default",
  autoScroll: false,
};

export function useReadingPreferences() {
  const isHydrated = useHydrated();
  
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    
    document.documentElement.style.setProperty(
      "--reading-font-size",
      `${preferences.fontSize}px`
    );

    if (preferences.readingMode === "night") {
      document.documentElement.classList.add("reading-mode-night");
    } else {
      document.documentElement.classList.remove("reading-mode-night");
    }
  }, [preferences, isHydrated]);

  const setFontSize = useCallback((fontSize: number) => {
    setPreferences((prev) => ({ ...prev, fontSize }));
  }, []);

  const setReadingMode = useCallback((readingMode: ReadingMode) => {
    setPreferences((prev) => ({ ...prev, readingMode }));
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setPreferences((prev) => ({ ...prev, autoScroll: !prev.autoScroll }));
  }, []);

  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) return;
    
    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1);
    }, 50);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (preferences.autoScroll) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [preferences.autoScroll, isHydrated, startAutoScroll, stopAutoScroll]);

  return {
    preferences,
    isLoaded: isHydrated,
    setFontSize,
    setReadingMode,
    toggleAutoScroll,
  };
}
