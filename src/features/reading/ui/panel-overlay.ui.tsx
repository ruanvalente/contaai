"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

type PanelOverlayProps = {
  visible: boolean;
  onClick: () => void;
  className?: string;
};

export function PanelOverlay({ visible, onClick, className }: PanelOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 bg-black/20 z-40 sm:hidden",
        className
      )}
      onClick={onClick}
    />
  );
}
