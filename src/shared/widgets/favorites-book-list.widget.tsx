import { Pagination } from "@/shared/ui/pagination.ui";
import { Book } from "@/server/domain/entities/book.entity";
import { FavoriteBookCard } from "./favorite-book-card.widget";

type FavoritesBookListProps = {
  books: Book[];
  favoritedIds: string[];
  onToggleFavorite: (book: Book) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function FavoritesBookList({
  books,
  favoritedIds,
  onToggleFavorite,
  currentPage,
  totalPages,
  onPageChange,
}: FavoritesBookListProps) {
  return (
    <>
      <p className="text-sm text-gray-500">
        {books.length} histórias favoritas
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <FavoriteBookCard
            key={book.id}
            book={book}
            isFavorited={favoritedIds.includes(book.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
