"use client";

import { Minus, Plus, Moon, Sun, Play, Pause } from "lucide-react";
import { cn } from "@/utils/cn";
import { ReadingMode } from "@/features/reading/types/reading.types";

type ReadingControlsProps = {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  isSaving?: boolean;
  className?: string;
};

const FONT_SIZES = [14, 16, 18, 20] as const;

export function ReadingControls({
  fontSize,
  onFontSizeChange,
  readingMode,
  onReadingModeChange,
  autoScroll,
  onAutoScrollToggle,
  isSaving,
  className,
}: ReadingControlsProps) {
  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize as typeof FONT_SIZES[number]);
    if (currentIndex > 0) {
      onFontSizeChange(FONT_SIZES[currentIndex - 1]);
    }
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize as typeof FONT_SIZES[number]);
    if (currentIndex < FONT_SIZES.length - 1) {
      onFontSizeChange(FONT_SIZES[currentIndex + 1]);
    }
  };

  const toggleTheme = () => {
    onReadingModeChange(readingMode === "default" ? "night" : "default");
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-primary-200 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">Fonte</span>
        <div className="flex items-center gap-1">
          <button
            onClick={decreaseFontSize}
            disabled={fontSize <= FONT_SIZES[0]}
            className="p-2 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Diminuir fonte"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="w-12 text-center text-sm font-medium text-gray-900">
            {fontSize}px
          </span>
          <button
            onClick={increaseFontSize}
            disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
            className="p-2 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Aumentar fonte"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            readingMode === "night"
              ? "bg-accent-100 text-accent-700"
              : "hover:bg-primary-100 text-gray-600"
          )}
          aria-label={
            readingMode === "default"
              ? "Ativar modo noturno"
              : "Desativar modo noturno"
          }
        >
          {readingMode === "night" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span className="hidden sm:inline text-sm font-medium">
            {readingMode === "night" ? "Noturno" : "Claro"}
          </span>
        </button>

        <button
          onClick={onAutoScrollToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            autoScroll
              ? "bg-accent-500 text-white"
              : "hover:bg-primary-100 text-gray-600"
          )}
          aria-label={autoScroll ? "Parar auto-scroll" : "Ativar auto-scroll"}
        >
          {autoScroll ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="hidden sm:inline text-sm font-medium">
            Auto
          </span>
        </button>
      </div>

      {isSaving !== undefined && (
        <div className="text-xs text-gray-400">
          {isSaving ? "Salvando..." : "Salvo"}
        </div>
      )}
    </div>
  );
}
