"use client";

import dynamic from "next/dynamic";
import { Container } from "@/shared/ui/container";
import { useSearchStore } from "@/features/discovery";

const RecommendedSectionWidget = dynamic(
  () => import("../widgets/recommended-section.widget").then(mod => mod.RecommendedSectionWidget),
  { ssr: false, loading: () => <div className="h-64" /> }
);

const CategoriesSectionWidget = dynamic(
  () => import("../widgets/categories-section.widget").then(mod => mod.CategoriesSectionWidget),
  { ssr: false, loading: () => <div className="h-96" /> }
);

const SearchResultsWidget = dynamic(
  () => import("../widgets/search-results.widget").then(mod => mod.SearchResultsWidget),
  { ssr: false, loading: () => <div className="h-64" /> }
);

const BookDetailsModalWidget = dynamic(
  () =>
    import("@/features/book-dashboard/editor/presentation/widgets/book-details-modal.widget").then(
      (mod) => mod.BookDetailsModalWidget,
    ),
  { ssr: false },
);

export function BookDashboardPage() {
  const query = useSearchStore((state) => state.query);
  const hasQuery = query.length > 0;
  
  return (
    <>
      <main className="pb-8">
        <Container>
          {hasQuery ? (
            <SearchResultsWidget
              query={query}
              books={[]}
              onSelectBook={() => {}}
              isLoading={false}
            />
          ) : (
            <>
              <RecommendedSectionWidget
                books={[]}
                onBookSelect={() => {}}
                isLoading={false}
              />
              <CategoriesSectionWidget
                books={[]}
                onBookSelect={() => {}}
                isLoading={false}
              />
            </>
          )}
        </Container>
      </main>
      <BookDetailsModalWidget
        book={null}
        onClose={() => {}}
      />
    </>
  );
}