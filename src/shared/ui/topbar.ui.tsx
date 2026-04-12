"use client";

import { SearchInput } from "./search-input.ui";
import { Avatar } from "./avatar.ui";
import { Menu, Bell } from "lucide-react";

type TopbarProps = {
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
          <Menu className="w-6 h-6 text-gray-700" />
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
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
          </button>

          <Avatar name={userName} src={userAvatar} />
        </div>
      </div>
    </header>
  );
}
