"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/shared/store/sidebar.store";
import { Sidebar } from "@/shared/ui/sidebar.ui";
import { Header } from "@/shared/ui/header.ui";
import { ErrorBoundary } from "@/shared/ui/error-boundary.ui";

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
        <ErrorBoundary fallback={<div className="h-16 bg-primary-100 border-b border-primary-300 flex items-center px-6"><p className="text-sm text-gray-500">Erro ao carregar cabeçalho</p></div>}>
          <Header />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div className="p-6 text-center text-gray-500"><p>Erro ao carregar conteúdo. Recarregue a página.</p></div>}>
          {children}
        </ErrorBoundary>
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
