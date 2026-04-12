"use client";

import { cn } from "@/utils/cn";
import { ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";
import { useReadingControls } from "@/features/reading/hooks/use-reading-controls";
import { FontSizeControl } from "./font-size-control.ui";
import { ThemeToggle } from "./theme-toggle.ui";
import { AutoScrollControl } from "./auto-scroll-control.ui";

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
  const {
    decreaseFontSize,
    increaseFontSize,
    toggleTheme,
    canDecreaseFontSize,
    canIncreaseFontSize,
  } = useReadingControls({
    fontSize,
    onFontSizeChange,
    readingMode,
    onReadingModeChange,
    onAutoScrollToggle,
  });

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-primary-200 shadow-sm",
        className,
      )}
    >
      <FontSizeControl
        fontSize={fontSize}
        onDecrease={decreaseFontSize}
        onIncrease={increaseFontSize}
        canDecrease={canDecreaseFontSize}
        canIncrease={canIncreaseFontSize}
      />

      <div className="flex items-center gap-2">
        <ThemeToggle readingMode={readingMode} onToggle={toggleTheme} />
        <AutoScrollControl
          autoScroll={autoScroll}
          onToggle={onAutoScrollToggle}
        />
      </div>

      {isSaving !== undefined && (
        <div className="text-xs text-gray-400">
          {isSaving ? "Salvando..." : "Salvo"}
        </div>
      )}
    </div>
  );
}
