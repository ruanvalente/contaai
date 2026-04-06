"use client";

import { X } from "lucide-react";

type PanelHeaderProps = {
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
};

export function PanelHeader({ title, onClose, showCloseButton = true }: PanelHeaderProps) {
  return (
    <div className="hidden sm:flex items-center justify-between px-5 py-3.5 border-b border-primary-100 bg-primary-50">
      <h3 className="font-medium text-gray-900">{title}</h3>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
          aria-label="Fechar painel"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

type PanelFooterMobileProps = {
  onClose: () => void;
  label?: string;
};

export function PanelFooterMobile({ onClose, label = "Fechar" }: PanelFooterMobileProps) {
  return (
    <div className="flex sm:hidden justify-center px-5 pb-5 pt-2">
      <button
        onClick={onClose}
        className="px-6 py-2.5 bg-accent-500 text-white rounded-lg font-medium text-sm w-full max-w-xs"
      >
        {label}
      </button>
    </div>
  );
}
