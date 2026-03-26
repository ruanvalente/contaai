import { Suspense } from "react";
import { getBooksPaginated } from "@/features/book-dashboard/data/server-books";
import { LibraryContent } from "@/features/book-dashboard/widgets/library-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    tab?: string;
  }>;
}

async function LibraryData({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { books, total, totalPages } = await getBooksPaginated(page, 10);

  return (
    <LibraryContent
      books={books}
      pagination={{ currentPage: page, totalPages, total }}
    />
  );
}

export default async function LibraryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LibraryData searchParams={searchParams} />
    </Suspense>
  );
}