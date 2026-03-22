"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { mockBooks } from "@/features/book-dashboard/data/books";

const favoriteBooks = mockBooks.slice(0, 6);

export function FavoritesPage() {
  const [favorites, setFavorites] = useState(favoriteBooks);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFavorite = (id: string) => {
    setFavorites(favorites.filter((book) => book.id !== id));
  };

  const filteredFavorites = favorites.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            {favorites.length > 0 && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar nos favoritos..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                />
              </div>
            )}

            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum favorito
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Adicione histórias aos favoritos para encontrá-las facilmente
                  depois.
                </p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Nenhum favorito encontrado para &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {favorites.length} histórias favoritas
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredFavorites.map((book) => (
                    <div
                      key={book.id}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-error hover:text-white transition-colors"
                        aria-label="Remover dos favoritos"
                      >
                        <HeartFilledIcon className="w-4 h-4 text-accent-500" />
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
                          <StarIcon className="w-3 h-3 text-warning" filled />
                          <span className="text-xs text-gray-600">
                            {book.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
