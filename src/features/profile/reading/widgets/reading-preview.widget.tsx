"use client";

import { useReadingPreferences } from "../hooks/use-reading-preferences";

export function ReadingPreview() {
  const { preferences } = useReadingPreferences();

  const isNightMode = preferences.readingMode === "night";

  return (
    <div className="mt-6 p-4 border border-primary-200 rounded-xl bg-primary-50">
      <p className="text-xs text-gray-500 mb-3 font-medium">Prévia da leitura</p>
      <div 
        className={`reading-content p-4 rounded-lg transition-colors duration-300 ${
          isNightMode ? "reading-mode-night" : ""
        }`}
        style={{
          fontSize: `${preferences.fontSize}px`,
          backgroundColor: isNightMode ? "#f5e6d3" : "#ffffff",
          color: isNightMode ? "#3d3429" : "#1a1a1a",
        }}
      >
        <p className="mb-3">
          Era uma vez, em uma terra muito distante, uma história que esperava 
          ser contada. As palavras dançavam na página, cada uma carregando um 
          peso de emoção e significado.
        </p>
        <p className="text-sm opacity-70">
          Aqui você pode ver como seu texto aparecerá durante a leitura.
        </p>
      </div>
    </div>
  );
}
