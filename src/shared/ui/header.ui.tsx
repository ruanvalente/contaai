"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSidebarStore } from "@/shared/store/sidebar.store";
import { useAuthStore } from "@/shared/storage/use-auth-store";
import { useSearchStore } from "@/features/discovery/stores/search.store";
import { searchBooksAction } from "@/features/book-dashboard/actions/books.actions";
import { signOutAction } from "@/features/auth/actions/auth.actions";
import { Avatar } from "@/shared/ui/avatar";
import { Book } from "@/features/book-dashboard/types/book.types";
import {
  Menu,
  Search,
  X,
  Loader2,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";

const SEARCH_ID = "header-search-input";
const SEARCH_RESULTS_ID = "header-search-results";
const USER_DROPDOWN_ID = "user-dropdown-menu";

export function Header() {
  const toggle = useSidebarStore((state) => state.toggle);
  const { user, initialize, clearAuth } = useAuthStore();
  const {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    setIsSearching,
    getFromCache,
    addToCache,
    clearResults,
  } = useSearchStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  const isDiscoveryPage = pathname === "/dashboard";

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
          dropdownButtonRef.current?.focus();
        }
        if (isSearchFocused) {
          setIsSearchFocused(false);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen, isSearchFocused]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const cachedResults = getFromCache(query);
    if (cachedResults) {
      setResults(cachedResults);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchBooksAction(query);
        setResults(searchResults);
        addToCache(query, searchResults);
      } catch (error) {
        console.error("Error searching books:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, getFromCache, setResults, addToCache, setIsSearching]);

  const handleLogout = async () => {
    await signOutAction();
    clearAuth();
    router.push("/login");
  };

  const handleBookSelect = (book: Book) => {
    clearResults();
    setQuery("");
    setIsSearchFocused(false);
    router.push(`/book-dashboard?id=${book.id}`);
  };

  const handleClearSearch = () => {
    setQuery("");
    clearResults();
    document.getElementById(SEARCH_ID)?.focus();
  };

  const userName = user?.name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatar_url || "";

  const showSearchResults = isSearchFocused && query.trim().length > 0;

  return (
    <header className="sticky top-0 z-50 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
      <div className="flex justify-between items-center px-3 py-3 lg:px-6">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            onClick={toggle}
            className="shrink-0 p-2 rounded-lg hover:bg-primary-200 transition-colors lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {isDiscoveryPage && (
            <div className="relative flex-1 max-w-xl" ref={searchRef}>
              <label htmlFor={SEARCH_ID} className="sr-only">
                Buscar livros
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden="true" />
              <input
                id={SEARCH_ID}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Buscar livros..."
                className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-primary-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                aria-autocomplete="list"
                aria-controls={SEARCH_RESULTS_ID}
                aria-expanded={showSearchResults}
                role="combobox"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" aria-hidden="true" />
              )}
              {!isSearching && query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}

              {showSearchResults && (
                <div
                  id={SEARCH_RESULTS_ID}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden z-50 max-h-80 overflow-y-auto"
                  role="listbox"
                  aria-label="Resultados da busca"
                >
                  {results.length > 0 ? (
                    <ul role="presentation">
                      {results.slice(0, 8).map((book) => (
                        <li key={book.id}>
                          <button
                            type="button"
                            onClick={() => handleBookSelect(book)}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-primary-50 transition-colors text-left focus-visible:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                            role="option"
                            aria-selected={false}
                          >
                            <div
                              className="w-10 h-14 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: book.coverColor }}
                              aria-hidden="true"
                            >
                              {book.title.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {book.title}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {book.author}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">
                              {book.category}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : !isSearching ? (
                    <div className="px-4 py-6 text-center text-gray-500" role="status" aria-live="polite">
                      <p>Nenhum resultado encontrado</p>
                      <p className="text-sm mt-1">
                        Tente buscar por outro termo
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 ml-2">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                ref={dropdownButtonRef}
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-controls={USER_DROPDOWN_ID}
              >
                <Avatar name={userName} src={userAvatar} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {userName}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isDropdownOpen && (
                <div
                  id={USER_DROPDOWN_ID}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden z-100"
                  role="menu"
                >
                  <div className="p-4 border-b border-primary-200">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>

                  <div className="py-2" role="none">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push("/dashboard/settings");
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 transition-colors w-full text-left focus-visible:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      role="menuitem"
                    >
                      <Settings className="w-5 h-5" aria-hidden="true" />
                      <span>Configurações</span>
                    </button>
                  </div>

                  <div className="border-t border-primary-200 py-2" role="none">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 transition-colors w-full text-left focus-visible:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
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
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-accent-500 text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-accent-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
