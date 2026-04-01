"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function calculateProgress(containerRef?: React.RefObject<HTMLElement | null>) {
  if (containerRef?.current) {
    const el = containerRef.current;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    return {
      percent: Math.min(100, Math.max(0, percent)),
      isAtTop: scrollTop < 10,
      isAtBottom: scrollTop >= maxScroll - 10,
    };
  }

  if (typeof window === "undefined") {
    return { percent: 0, isAtTop: true, isAtBottom: false };
  }

  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const maxScroll = scrollHeight - clientHeight;
  const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  return {
    percent: Math.min(100, Math.max(0, percent)),
    isAtTop: scrollTop < 10,
    isAtBottom: scrollTop >= maxScroll - 10,
  };
}

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

    const result = calculateProgress(containerRef);
    setScrollPercent(result.percent);
    setIsAtTop(result.isAtTop);
    setIsAtBottom(result.isAtBottom);
    onProgressChange?.(result.percent);
  }, [containerRef, throttleMs, onProgressChange]);

  useEffect(() => {
    const target = containerRef?.current ?? window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    const initial = calculateProgress(containerRef);
    setScrollPercent(initial.percent);
    setIsAtTop(initial.isAtTop);
    setIsAtBottom(initial.isAtBottom);

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, handleScroll]);

  const scrollToTop = useCallback(() => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [containerRef]);

  const scrollToPercent = useCallback(
    (percent: number) => {
      if (containerRef?.current) {
        const el = containerRef.current;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        const targetScroll = (percent / 100) * maxScroll;
        el.scrollTo({ top: targetScroll, behavior: "smooth" });
      } else {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const maxScroll = scrollHeight - clientHeight;
        const targetScroll = (percent / 100) * maxScroll;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    },
    [containerRef]
  );

  return {
    scrollPercent,
    isAtTop,
    isAtBottom,
    scrollToTop,
    scrollToPercent,
  };
}
