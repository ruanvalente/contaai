import { Suspense } from "react";
import { getBooksPaginated } from "@/features/book-dashboard/data/server-books";
import { DownloadsContent } from "@/features/book-dashboard/widgets/downloads-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function DownloadsData({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { books, total, totalPages } = await getBooksPaginated(page, 10);

  return (
    <DownloadsContent
      books={books}
      pagination={{ currentPage: page, totalPages, total }}
    />
  );
}

export default async function DownloadsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DownloadsData searchParams={searchParams} />
    </Suspense>
  );
}