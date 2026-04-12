"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/utils/cn";
import { ReadingMode } from "@/features/profile/reading/hooks/use-reading-preferences";

type ThemeToggleProps = {
  readingMode: ReadingMode;
  onToggle: () => void;
};

export function ThemeToggle({ readingMode, onToggle }: ThemeToggleProps) {
  const isNightMode = readingMode === "night";

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isNightMode
          ? "bg-accent-100 text-accent-700"
          : "hover:bg-primary-100 text-gray-600"
      )}
      aria-label={isNightMode ? "Desativar modo noturno" : "Ativar modo noturno"}
    >
      {isNightMode ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="hidden sm:inline text-sm font-medium">
        {isNightMode ? "Noturno" : "Claro"}
      </span>
    </button>
  );
}
