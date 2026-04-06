"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseDebouncedSaveReturn<T> = {
  debouncedSave: (value: T) => void;
  isSaving: boolean;
  cancel: () => void;
  saveNow: () => Promise<void>;
};

export function useDebouncedSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay: number = 2000
): UseDebouncedSaveReturn<T> {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<T | null>(null);
  const isSavingRef = useRef(false);

  const executeSave = useCallback(async () => {
    if (pendingRef.current === null || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    const valueToSave = pendingRef.current;
    pendingRef.current = null;

    try {
      await saveFn(valueToSave);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [saveFn]);

  const debouncedSave = useCallback(
    (value: T) => {
      pendingRef.current = value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        executeSave();
      }, delay);
    },
    [delay, executeSave]
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

    await executeSave();
  }, [executeSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      pendingRef.current = null;
    };
  }, []);

  return {
    debouncedSave,
    isSaving,
    cancel,
    saveNow,
  };
}
