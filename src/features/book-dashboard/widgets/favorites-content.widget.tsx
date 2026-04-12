"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/ui/container.ui";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { UserFavorite } from "@/features/discovery/actions/favorites.actions";
import { searchBooksAction } from "@/features/discovery/actions/books.actions";
import { useFavorites } from "@/features/discovery/hooks/use-favorites";
import { Search, Heart } from "lucide-react";

type FavoritesContentProps = {
  favorites: UserFavorite[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export function FavoritesContent({ favorites: initialFavorites, pagination }: FavoritesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [favorites, setFavorites] = useState<UserFavorite[]>(initialFavorites);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleFavorite } = useFavorites();

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      if (query.trim()) {
        const allFavorites = await searchBooksAction(query);
        const matchingFavorites = allFavorites.filter(book => 
          initialFavorites.some(fav => fav.bookId === book.id)
        );
        const mappedFavorites: UserFavorite[] = matchingFavorites.map(book => ({
          id: book.id,
          userId: '',
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookCoverColor: book.coverColor,
          bookCoverUrl: book.coverUrl,
          bookCategory: book.category ?? undefined,
          createdAt: new Date(),
        }));
        setFavorites(mappedFavorites);
      } else {
        setFavorites(initialFavorites);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialFavorites]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleToggleFavorite = async (book: UserFavorite) => {
    const validCategories = ['Sci-Fi', 'Fantasy', 'Drama', 'Business', 'Education', 'Geography'] as const;
    const category = (book.bookCategory && validCategories.includes(book.bookCategory as (typeof validCategories)[number]))
      ? book.bookCategory as (typeof validCategories)[number]
      : 'Drama';

    await toggleFavorite({
      id: book.bookId,
      title: book.bookTitle,
      author: book.bookAuthor,
      coverColor: book.bookCoverColor || '#6B7280',
      coverUrl: book.bookCoverUrl || '',
      category,
      rating: 0,
      pages: 0,
      description: '',
      ratingCount: 0,
      reviewCount: 0,
      createdAt: new Date(),
    });
    
    setFavorites(prev => prev.filter(fav => fav.bookId !== book.bookId));
  };

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
            {favorites.length > 0 && (
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

            {favorites.length === 0 && !searchQuery ? (
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
            ) : favorites.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Nenhum favorito encontrado para &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {pagination?.total || favorites.length} histórias favoritas
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favorites.map((book) => (
                    <div
                      key={book.bookId}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => handleToggleFavorite(book)}
                        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-error hover:text-white transition-colors"
                        aria-label="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4 text-accent-500 fill-accent-500" />
                      </button>

                      <div className="p-3">
                        <div
                          className="w-full aspect-2/3 rounded-lg shadow flex items-center justify-center p-2 mb-3"
                          style={{ backgroundColor: book.bookCoverColor || "#6B7280" }}
                        >
                          <span className="text-white/90 font-display text-xs text-center line-clamp-3">
                            {book.bookTitle}
                          </span>
                        </div>

                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {book.bookTitle}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.bookAuthor}
                        </p>

                        {book.bookCategory && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                            {book.bookCategory}
                          </span>
                        )}
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
