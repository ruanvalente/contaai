"use client";

import { useSidebar } from "@/shared/hooks/use-sidebar";
import { Sidebar } from "@/shared/ui/sidebar";
import { Container } from "@/shared/ui/container";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  action,
}: DashboardLayoutProps) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="min-h-screen bg-primary-100">
      <Sidebar isOpen={isOpen} onClose={close} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Container>{children}</Container>
        </main>
      </div>
    </div>
  );
}

export function MobileMenuButton() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-primary-200 lg:hidden"
      aria-label="Abrir menu"
    >
      <MenuIcon className="w-5 h-5 text-gray-700" />
    </button>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
