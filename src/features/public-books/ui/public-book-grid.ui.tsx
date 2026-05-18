import { BookCategory } from "@/server/domain/entities/book.entity";
import { cn } from "@/utils/cn";
import Image from "next/image";

type PublicBookGridProps = {
  books: Array<{
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    coverColor: string;
    category?: BookCategory;
    rating?: number;
  }>;
  isLoading?: boolean;
  onSelectBook?: (id: string) => void;
  selectedBookId?: string;
  emptyMessage?: string;
  className?: string;
};

export function PublicBookGrid({
  books,
  isLoading,
  onSelectBook,
  selectedBookId,
  emptyMessage = "Nenhum livro encontrado",
  className,
}: PublicBookGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4",
          className,
        )}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-2/3 w-full" />
            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4",
        className,
      )}
    >
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook?.(book.id)}
          className={cn(
            "flex flex-col items-center text-left bg-transparent cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg",
            selectedBookId === book.id && "ring-2 ring-accent-500",
          )}
        >
          <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-md">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                preload
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-2xl p-4"
                style={{ backgroundColor: book.coverColor }}
              >
                {book.title.charAt(0)}
              </div>
            )}
          </div>
          <div className="mt-2 text-center w-full">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
