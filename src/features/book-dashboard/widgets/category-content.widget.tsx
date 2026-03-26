"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/ui/container";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { usePaginationCache, generatePaginationKey } from "@/shared/store/pagination-cache.store";
import { Book } from "@/features/book-dashboard/types/book.types";
import { Star, Search } from "lucide-react";

interface CategoryContentProps {
  initialBooks: Book[];
  initialPagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  categories: string[];
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

const categoryIcons: Record<string, string> = {
  Drama: "🎭",
  Fantasy: "✨",
  "Sci-Fi": "🌌",
  Business: "💼",
  Education: "📚",
  Geography: "🌍",
};

export function CategoryContent({
  initialBooks,
  initialPagination,
  categories,
  serverPagination,
}: CategoryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || null;
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [displayedBooks, setDisplayedBooks] = useState<Book[]>(initialBooks);
  const [pagination, setPagination] = useState(serverPagination || initialPagination || { currentPage: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { getPage, addPage } = usePaginationCache();

  useEffect(() => {
    const cacheKey = generatePaginationKey(selectedCategory, searchQuery, currentPage);
    const cached = getPage(cacheKey);

    if (cached) {
      setDisplayedBooks(cached.books);
      setPagination(cached.pagination);
    } else if (serverPagination) {
      setDisplayedBooks(initialBooks);
      setPagination(serverPagination);
      addPage(cacheKey, initialBooks, serverPagination);
    }
  }, [currentPage, selectedCategory, searchQuery, initialBooks, serverPagination, getPage, addPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Categorias
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Explore histórias por tema
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("category");
                  params.set("page", "1");
                  router.push(`?${params.toString()}`);
                }}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                  !selectedCategory
                    ? "bg-accent-500 text-white shadow-lg scale-105"
                    : "bg-white hover:bg-accent-100 shadow-sm"
                }`}
                aria-pressed={!selectedCategory}
              >
                <span className="text-3xl mb-2">📚</span>
                <span
                  className={`text-sm font-medium ${!selectedCategory ? "text-white" : "text-gray-700"}`}
                >
                  Todos
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("category", category);
                    params.set("page", "1");
                    router.push(`?${params.toString()}`);
                  }}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                    selectedCategory === category
                      ? "bg-accent-500 text-white shadow-lg scale-105"
                      : "bg-white hover:bg-accent-100 shadow-sm"
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  <span className="text-3xl mb-2">
                    {categoryIcons[category] || "📖"}
                  </span>
                  <span
                    className={`text-sm font-medium ${selectedCategory === category ? "text-white" : "text-gray-700"}`}
                  >
                    {category}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-primary-300 pt-6">
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  defaultValue={searchQuery}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set("search", e.target.value);
                    } else {
                      params.delete("search");
                    }
                    params.set("page", "1");
                    router.push(`?${params.toString()}`);
                  }}
                  placeholder="Buscar nas categorias..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  aria-label="Buscar nas categorias"
                />
              </div>

              {displayedBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Nenhuma história encontrada
                    {searchQuery ? ` para "${searchQuery}"` : ""}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayedBooks.map((book) => (
                      <button
                        key={book.id}
                        className="flex flex-col items-center p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                      >
                        <div
                          className="w-full aspect-2/3 max-w-35 rounded-lg shadow flex items-center justify-center p-2 mb-3"
                          style={{ backgroundColor: book.coverColor }}
                        >
                          <span className="text-white/90 font-display text-xs text-center line-clamp-3">
                            {book.title}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 text-center line-clamp-2 w-full">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star
                            className="w-3 h-3 text-warning fill-warning"
                            aria-hidden="true"
                          />
                          <span className="text-xs text-gray-600">
                            {book.rating}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
