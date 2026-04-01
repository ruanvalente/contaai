"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";

type ReadingHeaderProps = {
  title: string;
  onBack: () => void;
  className?: string;
};

export function ReadingHeader({
  title,
  onBack,
  className,
}: ReadingHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-200",
        className
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-primary-100"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Voltar</span>
        </button>

        <h1 className="font-display font-semibold text-gray-900 truncate max-w-xs sm:max-w-md text-center">
          {title}
        </h1>

        <div className="w-10" />
      </div>
    </header>
  );
}
