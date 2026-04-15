import { Book } from "@/server/domain/entities/book.entity";

type BookCardProps = {
  book: Book;
  isFeatured?: boolean;
  onClick?: (book: Book) => void;
  className?: string;
}

export function BookCard({ book, onClick, className = "" }: BookCardProps) {
  return (
    <button
      onClick={() => onClick?.(book)}
      className={`flex flex-col items-center p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div
        className="w-full aspect-2/3 max-w-35 rounded-lg shadow flex flex-col items-center justify-center p-2"
        style={{ backgroundColor: book.coverColor }}
      >
        <span className="text-white/90 font-display text-xs text-center p-2 line-clamp-3">
          {book.title}
        </span>
      </div>
      <h3 className="mt-2 text-xs font-medium text-gray-900 line-clamp-2 text-center w-full truncate">
        {book.title}
      </h3>
      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{book.author}</p>
    </button>
  );
}
