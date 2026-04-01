"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { ReadingControls } from "@/features/reading/ui/reading-controls.ui";
import { ReadingMode } from "@/features/reading/types/reading.types";

type ReadingControlsPanelProps = {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  isSaving?: boolean;
  className?: string;
};

export function ReadingControlsPanel({
  fontSize,
  onFontSizeChange,
  readingMode,
  onReadingModeChange,
  autoScroll,
  onAutoScrollToggle,
  isSaving,
  className,
}: ReadingControlsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closePanel]);

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={togglePanel}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          isOpen
            ? "bg-accent-500 text-white rotate-90"
            : "bg-white text-gray-600 hover:bg-primary-50 border border-primary-200",
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          isOpen ? "Fechar configurações" : "Abrir configurações de leitura"
        }
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 sm:hidden"
              onClick={closePanel}
            />
            <motion.div
              ref={panelRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 sm:relative sm:bottom-auto sm:right-4 sm:top-24 sm:z-50",
                "sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:mb-4",
                className,
              )}
            >
              <div className="bg-white sm:rounded-2xl sm:shadow-xl border border-primary-200 sm:overflow-hidden sm:max-h-[calc(100vh-8rem)]">
                <div className="hidden sm:flex items-center justify-between px-5 py-3.5 border-b border-primary-100 bg-primary-50">
                  <h3 className="font-medium text-gray-900">
                    Configurações de Leitura
                  </h3>
                  <button
                    onClick={closePanel}
                    className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                    aria-label="Fechar painel"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="p-5">
                  <ReadingControls
                    fontSize={fontSize}
                    onFontSizeChange={onFontSizeChange}
                    readingMode={readingMode}
                    onReadingModeChange={onReadingModeChange}
                    autoScroll={autoScroll}
                    onAutoScrollToggle={onAutoScrollToggle}
                    isSaving={isSaving}
                  />
                </div>
                <div className="flex sm:hidden justify-center px-5 pb-5 pt-2">
                  <button
                    onClick={closePanel}
                    className="px-6 py-2.5 bg-accent-500 text-white rounded-lg font-medium text-sm w-full max-w-xs"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
