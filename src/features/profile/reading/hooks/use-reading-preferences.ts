"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

function loadFromStorage(): ReadingPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PREFERENCES;
}

export function useReadingPreferences() {
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [preferences, setPreferences] = useState<ReadingPreferences>(loadFromStorage);
  const [isLoaded, setIsLoaded] = useState(typeof window !== "undefined");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoaded(true);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
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
  }, [preferences, isLoaded]);

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
    if (!isLoaded) return;
    
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
  }, [preferences.autoScroll, isLoaded, startAutoScroll, stopAutoScroll]);

  return {
    preferences,
    isLoaded,
    setFontSize,
    setReadingMode,
    toggleAutoScroll,
  };
}
