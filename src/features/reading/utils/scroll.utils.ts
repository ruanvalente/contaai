export const SCROLL_THRESHOLD = 10;

type ScrollPosition = {
  percent: number;
  isAtTop: boolean;
  isAtBottom: boolean;
};

function getElementScroll(element: HTMLElement): ScrollPosition {
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const maxScroll = scrollHeight - clientHeight;
  const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  return {
    percent: Math.min(100, Math.max(0, percent)),
    isAtTop: scrollTop < SCROLL_THRESHOLD,
    isAtBottom: scrollTop >= maxScroll - SCROLL_THRESHOLD,
  };
}

function getWindowScroll(): ScrollPosition {
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
    isAtTop: scrollTop < SCROLL_THRESHOLD,
    isAtBottom: scrollTop >= maxScroll - SCROLL_THRESHOLD,
  };
}

export function extractScrollPosition(
  containerRef?: React.RefObject<HTMLElement | null>
): ScrollPosition {
  if (containerRef?.current) {
    return getElementScroll(containerRef.current);
  }
  return getWindowScroll();
}

export function scrollToTop(
  containerRef?: React.RefObject<HTMLElement | null>
): void {
  if (containerRef?.current) {
    containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function scrollToPosition(
  containerRef: React.RefObject<HTMLElement | null> | undefined,
  percent: number
): void {
  const targetPercent = Math.min(100, Math.max(0, percent));

  if (containerRef?.current) {
    const el = containerRef.current;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const targetScroll = (targetPercent / 100) * maxScroll;
    el.scrollTo({ top: targetScroll, behavior: "smooth" });
  } else {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (targetPercent / 100) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }
}
