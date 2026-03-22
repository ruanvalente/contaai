import { Book } from "@/features/book-dashboard/types/book.types";
import { BookCard } from "./book-card.ui";

interface BookGridProps {
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
}

export function BookGrid({ books, selectedBook, onSelectBook }: BookGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onSelect={onSelectBook}
          isSelected={selectedBook?.id === book.id}
        />
      ))}
    </div>
  );
}
