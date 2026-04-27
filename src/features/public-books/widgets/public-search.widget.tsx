"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { SearchInput } from "@/shared/ui/search-input.ui";
import type { PublicBookListItem } from "../types/public-books.types";

interface PublicSearchWidgetProps {
  placeholder?: string;
  className?: string;
  onSelect?: (book: PublicBookListItem) => void;
}

export function PublicSearchWidget({
  placeholder = "Buscar livros...",
  className,
  onSelect,
}: PublicSearchWidgetProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicBookListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const { searchPublicBooksAction } = await import("../actions/public-books.actions");
      const data = await searchPublicBooksAction(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (book: PublicBookListItem) => {
    setShowResults(false);
    setQuery(book.title);
    if (onSelect) {
      onSelect(book);
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <SearchInput
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((book) => (
            <button
              key={book.id}
              onClick={() => handleSelect(book)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-10 h-14 rounded flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: book.coverColor }}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  book.title.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{book.title}</p>
                <p className="text-sm text-gray-500">{book.author}</p>
                <p className="text-xs text-gray-400">{book.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.trim() && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center text-gray-500 z-50">
          Nenhum livro encontrado para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}