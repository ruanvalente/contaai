"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

type ProgressBarProps = {
  progress: number;
  visible: boolean;
  showLabel?: boolean;
  className?: string;
};

export function ProgressBar({
  progress,
  visible,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "w-full h-1 bg-primary-200 rounded-full overflow-hidden",
            className
          )}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Leitura ${Math.round(clampedProgress)}% concluída`}
        >
          <motion.div
            className="h-full bg-accent-500"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          {showLabel && (
            <span className="absolute right-0 -top-6 text-xs text-gray-500">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
