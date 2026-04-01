"use client";

import { useEffect, useCallback } from "react";

type UseClickOutsideOptions = {
  enabled: boolean;
  ignoreRefs: React.RefObject<HTMLElement | null>[];
  onClickOutside: () => void;
};

type UseClickOutsideReturn = void;

export function useClickOutside({
  enabled,
  ignoreRefs,
  onClickOutside,
}: UseClickOutsideOptions): UseClickOutsideReturn {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const isClickOutside = ignoreRefs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (isClickOutside) {
        onClickOutside();
      }
    },
    [ignoreRefs, onClickOutside]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [enabled, handleClickOutside]);
}
