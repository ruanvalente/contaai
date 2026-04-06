"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

type PanelContainerProps = {
  children: React.ReactNode;
  visible: boolean;
  className?: string;
};

export const PanelContainer = forwardRef<HTMLDivElement, PanelContainerProps>(
  ({ children, visible, className }, ref) => {
    if (!visible) return null;

    return (
      <motion.div
        ref={ref}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 sm:relative sm:bottom-auto sm:right-4 sm:top-24 sm:z-50",
          "sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:mb-4",
          className
        )}
      >
        <div className="bg-white sm:rounded-2xl sm:shadow-xl border border-primary-200 sm:overflow-hidden sm:max-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </motion.div>
    );
  }
);

PanelContainer.displayName = "PanelContainer";
