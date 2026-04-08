"use client";

import { useMemo } from "react";

const DEFAULT_ICONS: Record<string, string> = {
  Drama: "🎭",
  Fantasy: "✨",
  "Sci-Fi": "🌌",
  Business: "💼",
  Education: "📚",
  Geography: "🌍",
  All: "📚",
};

type UseCategoryIconsOptions = {
  customIcons?: Record<string, string>;
  fallback?: string;
};

type UseCategoryIconsReturn = {
  getIcon: (category: string) => string;
  icons: Record<string, string>;
};

export function useCategoryIcons(options: UseCategoryIconsOptions = {}): UseCategoryIconsReturn {
  const { customIcons = {}, fallback = "📖" } = options;

  const icons = useMemo(
    () => ({
      ...DEFAULT_ICONS,
      ...customIcons,
    }),
    [customIcons],
  );

  const getIcon = useMemo(
    () => (category: string) => icons[category] || fallback,
    [icons, fallback],
  );

  return useMemo(
    () => ({
      getIcon,
      icons,
    }),
    [getIcon, icons],
  );
}
