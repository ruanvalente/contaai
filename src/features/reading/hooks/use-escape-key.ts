"use client";

import { useEffect, useCallback } from "react";

type UseEscapeKeyOptions = {
  enabled: boolean;
  onEscape: () => void;
};

export function useEscapeKey({ enabled, onEscape }: UseEscapeKeyOptions): void {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    },
    [onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [enabled, handleEscape]);
}
