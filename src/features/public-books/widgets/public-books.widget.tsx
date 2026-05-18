"use client";

import { useState, useEffect } from "react";
import { PublicBookGrid } from "../ui/public-book-grid.ui";
import { CategoryFilter } from "../ui/category-filter.ui";
import {
  getPublicBooksAction,
  getFeaturedPublicBooksAction,
} from "../actions/public-books.actions";
import type { PublicBookListItem } from "../types/public-books.types";
import type { Category } from "@/server/domain/entities/book.entity";
import { cn } from "@/utils/cn";

type PublicBooksWidgetProps = {
  initialCategory?: Category;
  initialSearch?: string;
  featured?: boolean;
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  onSelectBook?: (book: PublicBookListItem) => void;
  className?: string;
};

export function PublicBooksWidget({
  initialCategory,
  initialSearch,
  featured = false,
  limit = 20,
  showFilters = false,
  showSearch = true,
  onSelectBook,
  className,
}: PublicBooksWidgetProps) {
  const [books, setBooks] = useState<PublicBookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    initialCategory || "All",
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedBookId, setSelectedBookId] = useState<string>();

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true);
      try {
        let data;
        if (featured) {
          data = await getFeaturedPublicBooksAction(limit);
        } else {
          const result = await getPublicBooksAction({
            category: selectedCategory === "All" ? undefined : selectedCategory,
            search: searchQuery || undefined,
            limit,
          });
          data = result.books;
        }
        setBooks(data);
      } catch (error) {
        console.error("Failed to load books:", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, [selectedCategory, searchQuery, featured, limit]);

  const handleSelectBook = (id: string) => {
    const book = books.find((b) => b.id === id);
    if (book) {
      setSelectedBookId(id);
      onSelectBook?.(book);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showSearch && !featured && (
        <div className="flex gap-4 items-center">
          <input
            type="search"
            placeholder="Buscar livros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {showFilters && !featured && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <PublicBookGrid
        books={books}
        isLoading={isLoading}
        onSelectBook={handleSelectBook}
        selectedBookId={selectedBookId}
        emptyMessage={
          featured ? "Nenhum livro em destaque" : "Nenhum livro encontrado"
        }
      />
    </div>
  );
}
