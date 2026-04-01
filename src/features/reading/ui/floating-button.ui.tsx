"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Settings, X } from "lucide-react";
import { cn } from "@/utils/cn";

type FloatingButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ isOpen, onClick, className }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          isOpen
            ? "bg-accent-500 text-white rotate-90"
            : "bg-white text-gray-600 hover:bg-primary-50 border border-primary-200",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Fechar configurações" : "Abrir configurações de leitura"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Settings className="w-5 h-5" />
        )}
      </motion.button>
    );
  }
);

FloatingButton.displayName = "FloatingButton";
