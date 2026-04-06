"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractScrollPosition, scrollToTop, scrollToPosition } from "@/features/reading/utils";

type UseScrollProgressOptions = {
  containerRef?: React.RefObject<HTMLElement | null>;
  throttleMs?: number;
  onProgressChange?: (percent: number) => void;
};

type UseScrollProgressReturn = {
  scrollPercent: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollToTop: () => void;
  scrollToPercent: (percent: number) => void;
};

export function useScrollProgress({
  containerRef,
  throttleMs = 100,
  onProgressChange,
}: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const lastUpdateRef = useRef(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;
    lastUpdateRef.current = now;

    const result = extractScrollPosition(containerRef);
    setScrollPercent(result.percent);
    setIsAtTop(result.isAtTop);
    setIsAtBottom(result.isAtBottom);
    onProgressChange?.(result.percent);
  }, [containerRef, throttleMs, onProgressChange]);

  useEffect(() => {
    const target = containerRef?.current ?? window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    const initial = extractScrollPosition(containerRef);
    setScrollPercent(initial.percent);
    setIsAtTop(initial.isAtTop);
    setIsAtBottom(initial.isAtBottom);

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, handleScroll]);

  const scrollToTopHandler = useCallback(() => {
    scrollToTop(containerRef);
  }, [containerRef]);

  const scrollToPercent = useCallback(
    (percent: number) => {
      scrollToPosition(containerRef, percent);
    },
    [containerRef]
  );

  return {
    scrollPercent,
    isAtTop,
    isAtBottom,
    scrollToTop: scrollToTopHandler,
    scrollToPercent,
  };
}
