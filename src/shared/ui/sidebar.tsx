"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, 
  Compass, 
  LayoutGrid, 
  Library, 
  Download, 
  Headphones, 
  Heart, 
  Settings, 
  LogOut 
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: "/dashboard", label: "Descobrir", icon: Compass },
  { href: "/dashboard/category", label: "Categorias", icon: LayoutGrid },
  { href: "/dashboard/library", label: "Minha Biblioteca", icon: Library },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/audio", label: "Audio Books", icon: Headphones },
  { href: "/dashboard/favorites", label: "Favoritos", icon: Heart },
];

const footerItems = [
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#2d2419] text-white z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Menu principal"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <Book className="w-8 h-8 text-accent-500" aria-hidden="true" />
              <span className="text-xl font-bold">ContaAI</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1" role="list">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-accent-500 text-white"
                          : "text-[#c2a47e] hover:bg-[#3d3429] hover:text-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-white/10">
            <ul className="space-y-1" role="list">
              {footerItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-accent-500 text-white"
                          : "text-[#c2a47e] hover:bg-[#3d3429] hover:text-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full mt-2 text-[#c2a47e] hover:bg-[#3d3429] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-inset"
              onClick={onClose}
              aria-label="Sair da conta"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
