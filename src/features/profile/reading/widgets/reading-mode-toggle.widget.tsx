"use client";

import { Moon, Sun } from "lucide-react";
import { ReadingMode } from "../hooks/use-reading-preferences";

type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

function ToggleSwitch({ isOn, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        isOn ? "bg-accent-500" : "bg-primary-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          isOn ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

interface ReadingModeToggleProps {
  value: ReadingMode;
  onChange: (value: ReadingMode) => void;
}

export function ReadingModeToggle({ value, onChange }: ReadingModeToggleProps) {
  const isNightMode = value === "night";

  const handleToggle = () => {
    onChange(isNightMode ? "default" : "night");
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isNightMode ? "bg-accent-500/10" : "bg-gray-100"
          }`}
        >
          {isNightMode ? (
            <Moon className="w-5 h-5 text-accent-500" />
          ) : (
            <Sun className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">Modo noturno</p>
          <p className="text-sm text-gray-500">
            Tons mais quentes para leitura
          </p>
        </div>
      </div>
      <ToggleSwitch isOn={isNightMode} onToggle={handleToggle} />
    </div>
  );
}
