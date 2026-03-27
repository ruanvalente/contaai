import { Heart, Star } from "lucide-react";
import { Book } from "@/features/book-dashboard/types/book.types";

type FavoriteBookCardProps = {
  book: Book;
  isFavorited: boolean;
  onToggleFavorite: (book: Book) => void;
};

export function FavoriteBookCard({ book, isFavorited, onToggleFavorite }: FavoriteBookCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      <button
        onClick={() => onToggleFavorite(book)}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-error hover:text-white transition-colors"
        aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "text-accent-500 fill-accent-500" : "text-gray-400"}`} />
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
        <p className="text-xs text-gray-500 mt-1">{book.author}</p>

        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span className="text-xs text-gray-600">{book.rating}</span>
        </div>
      </div>
    </div>
  );
}
