"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UseLibraryStateReturn = {
  publishedBookId: string | null;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  clearPublished: () => void;
};

export function useLibraryState(): UseLibraryStateReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [publishedBookId, setPublishedBookId] = useState<string | null>(
    searchParams.get("published")
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const clearPublished = useCallback(() => {
    setPublishedBookId(null);
  }, []);

  useEffect(() => {
    if (publishedBookId) {
      const timer = setTimeout(() => {
        setPublishedBookId(null);
        router.replace(
          `?tab=${searchParams.get("tab") || "my-stories"}`,
          { scroll: false }
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [publishedBookId, router, searchParams]);

  return {
    publishedBookId,
    deletingId,
    setDeletingId,
    clearPublished,
  };
}
