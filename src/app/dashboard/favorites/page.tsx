import { Suspense } from "react";
import { getBooksPaginated } from "@/features/book-dashboard/data/server-books";
import { FavoritesContent } from "@/features/book-dashboard/widgets/favorites-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function FavoritesData({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { books, total, totalPages } = await getBooksPaginated(page, 10);

  return (
    <FavoritesContent
      books={books}
      pagination={{ currentPage: page, totalPages, total }}
    />
  );
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FavoritesData searchParams={searchParams} />
    </Suspense>
  );
}