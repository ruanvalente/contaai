"use client";

import { Book } from "@/domain/entities/book.entity";
import { BookCard } from "../ui/book-card.ui";

type SearchResultsWidgetProps = {
  query: string;
  books: Book[];
  onSelectBook: (book: Book) => void;
  isLoading?: boolean;
}

export function SearchResultsWidget({
  query,
  books,
  onSelectBook,
  isLoading = false,
}: SearchResultsWidgetProps) {
  if (isLoading) {
    return (
      <section className="py-4 sm:py-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
          Resultados para &quot;{query}&quot;
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse flex flex-col items-center p-2">
              <div className="w-full aspect-[2/3] max-w-[140px] bg-primary-200 rounded-lg" />
              <div className="mt-2 w-20 h-3 bg-primary-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="py-4 sm:py-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
          Resultados para &quot;{query}&quot;
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum livro encontrado.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
        Resultados para &quot;{query}&quot;
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={onSelectBook}
          />
        ))}
      </div>
    </section>
  );
}
