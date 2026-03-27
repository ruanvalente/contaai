"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/ui/container";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { useCategoryCache, generateCacheKey } from "@/shared/store/category-cache.store";
import { Book } from "@/features/book-dashboard/types/book.types";
import { searchBooksAction } from "@/features/book-dashboard/actions/books.actions";
import { Search, Heart, Star } from "lucide-react";

interface FavoritesContentProps {
  books: Book[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export function FavoritesContent({ books: initialBooks, pagination }: FavoritesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { addToCache, getFromCache } = useCategoryCache();

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const handleSearch = useCallback(async (query: string) => {
    const cacheKey = generateCacheKey("favorites", query, "all");

    const cached = getFromCache(cacheKey);
    if (cached) {
      setBooks(cached);
      return;
    }

    setIsLoading(true);
    try {
      if (query.trim()) {
        const results = await searchBooksAction(query);
        setBooks(results);
        addToCache(cacheKey, results);
      } else {
        setBooks(initialBooks);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialBooks, addToCache, getFromCache]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const displayBooks = books.filter((book) => !favorites.includes(book.id));

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
            Favoritos
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Suas histórias preferidas
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            {displayBooks.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set("search", e.target.value);
                    } else {
                      params.delete("search");
                    }
                    router.push(`?${params.toString()}`);
                  }}
                  placeholder="Buscar nos favoritos..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  aria-label="Buscar nos favoritos"
                />
              </div>
            )}

            {displayBooks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-gray-500" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum favorito
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Adicione histórias aos favoritos para encontrá-las facilmente depois.
                </p>
              </div>
            ) : isLoading ? (
              <BookListSkeleton />
            ) : displayBooks.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Nenhum favorito encontrado para &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {pagination?.total || displayBooks.length} histórias favoritas
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayBooks.map((book) => (
                    <div
                      key={book.id}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-error hover:text-white transition-colors"
                        aria-label="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4 text-accent-500 fill-accent-500" />
                      </button>

                      <div className="p-3">
                        <div
                          className="w-full aspect-2/3 rounded-lg shadow flex items-center justify-center p-2 mb-3"
                          style={{ backgroundColor: book.coverColor }}
                        >
                          <span className="text-white/90 font-display text-xs text-center line-clamp-3">
                            {book.title}
                          </span>
                        </div>

                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.author}
                        </p>

                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-xs text-gray-600">
                            {book.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}