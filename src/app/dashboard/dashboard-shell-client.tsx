"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/shared/store/sidebar.store";
import { Sidebar } from "@/shared/ui/sidebar.ui";
import { Header } from "@/shared/ui/header.ui";

type DashboardShellProps = {
  children: React.ReactNode;
}

export function DashboardShellClient({ children }: DashboardShellProps) {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  return (
    <div className="min-h-screen bg-primary-100">
      <Sidebar isOpen={isOpen} onClose={close} />

      <div className="lg:pl-64">
        <Header />
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
