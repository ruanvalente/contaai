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
  { href: "/", label: "Descobrir", icon: Compass },
  { href: "/category", label: "Categorias", icon: LayoutGrid },
  { href: "/library", label: "Minha Biblioteca", icon: Library },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/audio-books", label: "Audio Books", icon: Headphones },
  { href: "/favorites", label: "Favoritos", icon: Heart },
];

const footerItems = [
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#2d2419] text-white z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <Book className="w-8 h-8 text-accent-500" />
              <span className="text-xl font-bold">ContaAI</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
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
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-white/10">
            <ul className="space-y-1">
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
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full mt-2 text-[#c2a47e] hover:bg-[#3d3429] hover:text-white"
              onClick={onClose}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
