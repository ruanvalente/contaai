"use client";

import { Suspense } from "react";
import { Container } from "@/shared/ui/container";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { CategoryHeader } from "@/shared/ui/category-header.ui";
import { BookSearch } from "@/shared/ui/book-search.ui";
import { BookGrid, EmptyState } from "@/shared/ui/book-grid.ui";
import { CategoryFilterBar } from "@/shared/widgets/category-filter-bar.widget";
import { useCategoryFilter } from "@/features/discovery/hooks/use-category-filter";
import { useBooksWithCache } from "@/features/book-dashboard/hooks/use-books-with-cache";
import { Book } from "@/features/book-dashboard/types/book.types";

type CategoryContentProps = {
  initialBooks: Book[];
  initialPagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  categories: string[];
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
};

export function CategoryContent({
  initialBooks,
  initialPagination,
  categories,
  serverPagination,
}: CategoryContentProps) {
  const { category, search, page, setCategory, setSearch, setPage } =
    useCategoryFilter();

  const { books, pagination } = useBooksWithCache({
    initialBooks,
    initialPagination,
    serverPagination,
    category,
    search,
    page,
  });

  return (
    <>
      <CategoryHeader />

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <CategoryFilterBar
              categories={categories}
              selectedCategory={category}
              onSelectCategory={setCategory}
            />

            <div className="border-t border-primary-300 pt-6">
              <div className="relative mb-4">
                <BookSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar nas categorias..."
                />
              </div>

              {books.length === 0 ? (
                <EmptyState searchQuery={search} />
              ) : (
                <Suspense fallback={<BookListSkeleton />}>
                  <BookGrid books={books} />
                  {pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </Suspense>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
