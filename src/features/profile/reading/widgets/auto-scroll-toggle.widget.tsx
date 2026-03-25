"use client";

import { ScrollText } from "lucide-react";

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

interface AutoScrollToggleProps {
  value: boolean;
  onToggle: () => void;
}

export function AutoScrollToggle({ value, onToggle }: AutoScrollToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            value ? "bg-accent-500/10" : "bg-gray-100"
          }`}
        >
          <ScrollText
            className={`w-5 h-5 ${value ? "text-accent-500" : "text-gray-500"}`}
          />
        </div>
        <div>
          <p className="font-medium text-gray-900">Auto-scroll</p>
          <p className="text-sm text-gray-500">
            Role automaticamente durante leitura
          </p>
        </div>
      </div>
      <ToggleSwitch isOn={value} onToggle={onToggle} />
    </div>
  );
}
