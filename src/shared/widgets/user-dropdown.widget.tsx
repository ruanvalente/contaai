"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "../ui/avatar";
import { ChevronDown, User, Library, Heart, Settings, LogOut } from "lucide-react";

type UserDropdownProps = {
  userName?: string;
  email?: string;
  userAvatar?: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={onLogin}
        className="px-4 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
      >
        Entrar
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar name={userName} src={userAvatar} size="md" />
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-gray-900">{userName || "Usuário"}</p>
            <p className="text-sm text-gray-500">{email || ""}</p>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              href="/library"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Library className="w-5 h-5" />
              <span>Minha Biblioteca</span>
            </Link>

            <Link
              href="/favorites"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-5 h-5" />
              <span>Favoritos</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
          </div>

          <div className="border-t border-border py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
