"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

type FontSizeControlProps = {
  fontSize: number;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
};

export function FontSizeControl({
  fontSize,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
}: FontSizeControlProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 font-medium">Fonte</span>
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrease}
          disabled={!canDecrease}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "hover:bg-primary-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Diminuir fonte"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        <span className="w-12 text-center text-sm font-medium text-gray-900">
          {fontSize}px
        </span>
        <button
          onClick={onIncrease}
          disabled={!canIncrease}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "hover:bg-primary-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Aumentar fonte"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
