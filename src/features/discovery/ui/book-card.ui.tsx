import { Book } from "@/domain/entities/book.entity";

type BookCardProps = {
  book: Book;
  isSelected: boolean;
  onSelect: (book: Book) => void;
}

export function BookCard({ book, isSelected, onSelect }: BookCardProps) {
  return (
    <button
      onClick={() => onSelect(book)}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
        isSelected
          ? "bg-accent-500/10 ring-2 ring-accent-500"
          : "hover:bg-accent-100"
      }`}
    >
      <div
        className="w-full aspect-2/3 max-w-35 rounded-lg shadow-md flex items-center justify-center"
        style={{ backgroundColor: book.coverColor }}
      >
        <span className="text-white/90 text-xs font-display text-center p-2 line-clamp-3">
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
