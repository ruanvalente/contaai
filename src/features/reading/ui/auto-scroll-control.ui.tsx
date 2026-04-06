"use client";

import { Play, Pause } from "lucide-react";
import { cn } from "@/utils/cn";

type AutoScrollControlProps = {
  autoScroll: boolean;
  onToggle: () => void;
};

export function AutoScrollControl({ autoScroll, onToggle }: AutoScrollControlProps) {
  return (
    <button
      onClick={onToggle}
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
  );
}
