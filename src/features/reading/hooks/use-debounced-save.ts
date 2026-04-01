"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay: number = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<T | null>(null);

  const debouncedSave = useCallback(
    (value: T) => {
      pendingRef.current = value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (pendingRef.current !== null) {
          setIsSaving(true);
          try {
            await saveFn(pendingRef.current);
          } finally {
            setIsSaving(false);
            pendingRef.current = null;
          }
        }
      }, delay);
    },
    [saveFn, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (pendingRef.current !== null) {
      setIsSaving(true);
      try {
        await saveFn(pendingRef.current);
      } finally {
        setIsSaving(false);
        pendingRef.current = null;
      }
    }
  }, [saveFn]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSave,
    isSaving,
    cancel,
    saveNow,
  };
}
