"use client";

import { LucideIcon } from "lucide-react";

export type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  icon?: LucideIcon;
  label?: string;
  title: string;
};

export function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  label,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 sm:p-2 rounded hover:bg-primary-200 transition-colors ${
        isActive ? "bg-accent-100 text-accent-600" : "text-gray-600"
      }`}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
    >
      {Icon ? (
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      ) : (
        <span className="text-xs sm:text-sm font-medium">{label}</span>
      )}
    </button>
  );
}

export function ToolbarDivider() {
  return <div className="w-px h-5 sm:h-6 bg-primary-200 mx-0.5 sm:mx-1" />;
}
