"use client";

import { useRouter } from "next/navigation";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { useSearch } from "@/shared/hooks/use-search";
import { SearchIcon, CloseIcon, MenuIcon } from "../ui/icons.ui";

interface BookDashboardHeaderWidgetProps {
  onLogin?: () => void;
}

export function BookDashboardHeaderWidget({
  onLogin,
}: BookDashboardHeaderWidgetProps) {
  const { toggle } = useSidebar();
  const { query, setQuery } = useSearch();
  const router = useRouter();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
      <div className="flex items-center gap-2 px-3 py-3 lg:px-6">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-primary-200 lg:hidden shrink-0"
          aria-label="Abrir menu"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-primary-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-200"
                aria-label="Limpar busca"
              >
                <CloseIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <button
            onClick={handleLogin}
            className="shrink-0 px-4 py-2 bg-accent-500 text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-accent-600 transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}
