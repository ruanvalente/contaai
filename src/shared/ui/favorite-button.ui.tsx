"use client";

import { Heart } from "lucide-react";
import { cn } from "@/utils/cn";

type FavoriteButtonProps = {
  isFavorited: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function FavoriteButton({
  isFavorited,
  isLoading = false,
  onClick,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const sizeClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "p-1.5 w-8 h-8",
    md: "p-2 w-10 h-10",
    lg: "p-2.5 w-12 h-12",
  };

  const iconSizes: Record<"sm" | "md" | "lg", string> = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "rounded-full shadow-md hover:bg-error hover:text-white transition-all duration-200",
        "flex items-center justify-center",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-accent-500/20",
        sizeClasses[size],
        className
      )}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn(
          "transition-colors duration-200",
          iconSizes[size],
          isFavorited ? "fill-accent-500 text-accent-500" : "text-gray-500 hover:text-white"
        )}
      />
    </button>
  );
}
