import { Book } from "@/server/domain/entities/book.entity";
import { RecommendedSectionWidget } from "@/features/book-details/widgets/recommended-section.widget";
import { CategoriesSectionWidget } from "@/features/book-dashboard/widgets/categories-section.widget";

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
