"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "../ui/avatar";
import {
  ChevronDown,
  User,
  Library,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";

const DROPDOWN_ID = "user-dropdown-menu";

type UserDropdownProps = {
  userName?: string;
  email?: string;
  userAvatar?: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function UserDropdown({
  userName,
  email,
  userAvatar,
  isAuthenticated,
  onLogin,
  onLogout,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className="px-4 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        Entrar
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={DROPDOWN_ID}
      >
        <Avatar name={userName} src={userAvatar} size="md" />
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={DROPDOWN_ID}
          className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50"
          role="menu"
          aria-label="Menu do usuário"
        >
          <div className="p-4 border-b border-border">
            <p className="font-medium text-gray-900">{userName || "Usuário"}</p>
            <p className="text-sm text-gray-500">{email || ""}</p>
          </div>

          <div className="py-2" role="none">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <User className="w-5 h-5" aria-hidden="true" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              href="/library"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Library className="w-5 h-5" aria-hidden="true" />
              <span>Minha Biblioteca</span>
            </Link>

            <Link
              href="/favorites"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              <span>Favoritos</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
              <span>Configurações</span>
            </Link>
          </div>

          <div className="border-t border-border py-2" role="none">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              role="menuitem"
              aria-label="Sair da conta"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
