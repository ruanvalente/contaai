"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/ui/container";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { Book } from "@/features/book-dashboard/types/book.types";
import { Star, Heart } from "lucide-react";

interface BookGridProps {
  books: Book[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  emptyMessage?: string;
  searchPlaceholder?: string;
  showFavoriteButton?: boolean;
  onRemoveFavorite?: (bookId: string) => void;
  isLoading?: boolean;
}

export function BookGrid({
  books,
  pagination,
  emptyMessage = "Nenhum livro encontrado",
  searchPlaceholder = "Buscar...",
  showFavoriteButton = false,
  onRemoveFavorite,
  isLoading = false,
}: BookGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return <BookListSkeleton />;
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {showFavoriteButton && onRemoveFavorite && (
              <button
                onClick={() => onRemoveFavorite(book.id)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-error hover:text-white transition-colors"
                aria-label="Remover dos favoritos"
              >
                <Heart className="w-4 h-4 text-accent-500 fill-accent-500" />
              </button>
            )}

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
              <p className="text-xs text-gray-500 mt-1">{book.author}</p>

              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs text-gray-600">{book.rating}</span>
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
  );
}