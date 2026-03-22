"use client";

import { SearchInput } from "./search-input";
import { Avatar } from "./avatar";

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userName?: string;
  userAvatar?: string;
  onMenuClick: () => void;
}

export function Topbar({
  searchQuery,
  onSearchChange,
  userName,
  userAvatar,
  onMenuClick,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
          aria-label="Abrir menu"
        >
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 max-w-xl">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar livros, autores..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100"
            aria-label="Notificações"
          >
            <BellIcon className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
          </button>

          <Avatar name={userName} src={userAvatar} />
        </div>
      </div>
    </header>
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
