"use client";

import { useReadingPreferences } from "../hooks/use-reading-preferences";
import { FontSizeSelector } from "./font-size-selector.widget";
import { ReadingModeToggle } from "./reading-mode-toggle.widget";
import { AutoScrollToggle } from "./auto-scroll-toggle.widget";
import { ReadingPreview } from "./reading-preview.widget";

export function ReadingSectionWidget() {
  const {
    preferences,
    isLoaded,
    setFontSize,
    setReadingMode,
    toggleAutoScroll,
  } = useReadingPreferences();

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Preferências de Leitura</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Preferências de Leitura</h2>
      
      <div className="space-y-4">
        <FontSizeSelector
          value={preferences.fontSize}
          onChange={setFontSize}
        />
        <ReadingModeToggle
          value={preferences.readingMode}
          onChange={setReadingMode}
        />
        <AutoScrollToggle
          value={preferences.autoScroll}
          onToggle={toggleAutoScroll}
        />
      </div>
      
      <ReadingPreview />
      
      <p className="text-xs text-gray-400 pt-2">
        As alterações são salvas automaticamente e aplicadas em tempo real.
      </p>
    </div>
  );
}
