import { Book } from "@/domain/entities/book.entity";
import { RecommendedSectionWidget } from "@/features/book-dashboard/books/presentation/widgets/recommended-section.widget";
import { CategoriesSectionWidget } from "@/features/book-dashboard/books/presentation/widgets/categories-section.widget";

type DiscoverContentProps = {
  books: Book[];
  recommendedBooks: Book[];
  onBookSelect: (book: Book) => void;
  isLoading: boolean;
}

export function DiscoverContent({
  books,
  recommendedBooks,
  onBookSelect,
  isLoading,
}: DiscoverContentProps) {
  return (
    <>
      <RecommendedSectionWidget
        books={recommendedBooks}
        onBookSelect={onBookSelect}
        isLoading={isLoading}
      />

      <CategoriesSectionWidget
        books={books}
        onBookSelect={onBookSelect}
        isLoading={isLoading}
      />
    </>
  );
}
