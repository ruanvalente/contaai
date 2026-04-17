'use client';

import { useEffect } from 'react';
import { useAuthorFollowStore } from './use-author-follow';

export function useAuthorFollowInitialized() {
  const initialize = useAuthorFollowStore((state) => state.initialize);
  const isInitialized = useAuthorFollowStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return isInitialized;
}