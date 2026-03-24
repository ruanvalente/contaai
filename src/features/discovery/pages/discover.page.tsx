"use client";

import { Container } from "@/shared/ui/container";
import { DiscoverContent } from "../widgets/discover-content.widget";
import { SearchResults } from "../widgets/search-results.widget";
import { BookDetailsModal } from "../widgets/book-details-modal.widget";
import { useDiscover } from "../hooks/use-discover.hook";
import { Book } from "@/features/book-dashboard/types/book.types";

type DiscoverPageProps = {
  initialBooks?: Book[];
}

export function DiscoverPage({ initialBooks = [] }: DiscoverPageProps) {
  const {
    books,
    recommendedBooks,
    filteredBooks,
    selectedBook,
    isSearchActive,
    isLoading,
    query,
    handleBookSelect,
    handleClearSelection,
  } = useDiscover({ initialBooks });

  return (
    <>
      <main className={`pb-8 transition-all duration-300 ${selectedBook ? "xl:pr-96" : ""}`}>
        <Container>
          {isSearchActive ? (
            <SearchResults
              query={query}
              books={filteredBooks}
              selectedBook={selectedBook}
              onSelectBook={handleBookSelect}
            />
          ) : (
            <DiscoverContent
              books={books}
              recommendedBooks={recommendedBooks}
              onBookSelect={handleBookSelect}
              isLoading={isLoading}
            />
          )}
        </Container>
      </main>

      <BookDetailsModal
        book={selectedBook}
        onClose={handleClearSelection}
      />
    </>
  );
}
