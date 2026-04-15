import { Book } from "@/server/domain/entities/book.entity";
import { BookGrid } from "../ui/book-grid.ui";
import { EmptyState, SearchEmptyIcon } from "../ui/empty-state.ui";

type SearchResultsProps = {
  query: string;
  books: Book[];
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
}

export function SearchResults({ query, books, selectedBook, onSelectBook }: SearchResultsProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="Nenhum resultado"
        description={`Não encontramos histórias para "${query}"`}
        icon={<SearchEmptyIcon />}
      />
    );
  }

  return (
    <section className="py-4 sm:py-6">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
        Resultados para &quot;{query}&quot;
      </h2>
      <BookGrid
        books={books}
        selectedBook={selectedBook}
        onSelectBook={onSelectBook}
      />
    </section>
  );
}
