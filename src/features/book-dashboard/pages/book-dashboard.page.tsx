"use client";

import { Container } from "@/shared/ui/container";
import { BookDetailsModalWidget } from "../widgets/book-details-modal.widget";
import { RecommendedSectionWidget } from "../widgets/recommended-section.widget";
import { CategoriesSectionWidget } from "../widgets/categories-section.widget";
import { SearchResultsWidget } from "../widgets/search-results.widget";
import { useBookDashboard } from "../hooks/use-book-dashboard.hook";

export function BookDashboardPage() {
  const {
    books,
    recommendedBooks,
    filteredBooks,
    selectedBook,
    isSearchActive,
    isLoading,
    handleBookSelect,
    handleClearSelection,
  } = useBookDashboard();

  return (
    <>
      <main className="pb-8">
        <Container>
          {isSearchActive ? (
            <SearchResultsWidget
              query={
                filteredBooks.length > 0 ? filteredBooks[0]?.title || "" : ""
              }
              books={filteredBooks}
              onSelectBook={handleBookSelect}
              isLoading={isLoading}
            />
          ) : (
            <>
              <RecommendedSectionWidget
                books={recommendedBooks}
                onBookSelect={handleBookSelect}
                isLoading={isLoading}
              />

              <CategoriesSectionWidget
                books={books}
                onBookSelect={handleBookSelect}
                isLoading={isLoading}
              />
            </>
          )}
        </Container>
      </main>
      <BookDetailsModalWidget
        book={selectedBook}
        onClose={handleClearSelection}
      />
    </>
  );
}
