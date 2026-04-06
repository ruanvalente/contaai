export type ThemeMode = "default" | "night";

type ReadingColors = {
  textColor: string;
  codeBackground: string;
};

const THEME_COLORS: Record<ThemeMode, ReadingColors> = {
  default: {
    textColor: "#1a1a1a",
    codeBackground: "#f3f4f6",
  },
  night: {
    textColor: "#3d3429",
    codeBackground: "#4a4a4a",
  },
};

export function getReadingColors(isNightMode: boolean): ReadingColors {
  return isNightMode ? THEME_COLORS.night : THEME_COLORS.default;
}

export function getTextColor(readingMode: ThemeMode): string {
  return THEME_COLORS[readingMode]?.textColor ?? THEME_COLORS.default.textColor;
}

export function getCodeBackground(readingMode: ThemeMode): string {
  return THEME_COLORS[readingMode]?.codeBackground ?? THEME_COLORS.default.codeBackground;
}
