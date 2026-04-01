export const FONT_SIZES = [14, 16, 18, 20] as const;

export const MIN_FONT_SIZE = FONT_SIZES[0];
export const MAX_FONT_SIZE = FONT_SIZES[FONT_SIZES.length - 1];

export function isValidFontSize(size: number): boolean {
  return FONT_SIZES.includes(size as typeof FONT_SIZES[number]);
}

export function getNextFontSize(current: number, direction: "increase" | "decrease"): number | null {
  const currentIndex = FONT_SIZES.indexOf(current as typeof FONT_SIZES[number]);
  
  if (currentIndex === -1) {
    return FONT_SIZES[1];
  }
  
  if (direction === "increase" && currentIndex < FONT_SIZES.length - 1) {
    return FONT_SIZES[currentIndex + 1];
  }
  
  if (direction === "decrease" && currentIndex > 0) {
    return FONT_SIZES[currentIndex - 1];
  }
  
  return null;
}
