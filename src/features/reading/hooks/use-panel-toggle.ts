"use client";

import { useState, useCallback } from "react";

type UsePanelToggleReturn = {
  isOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
};

export function usePanelToggle(): UsePanelToggleReturn {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    togglePanel,
    openPanel,
    closePanel,
  };
}
