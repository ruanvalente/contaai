import { Suspense } from "react";
import { getBooksPaginated } from "@/features/book-dashboard/data/server-books";
import { DownloadsContent } from "@/features/library/widgets/downloads-content.widget";
import type { PagePropsWithSearch } from "@/shared/types/next.types";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type DownloadsPageProps = PagePropsWithSearch<{ page?: string; search?: string }>;

async function DownloadsData({ searchParams }: DownloadsPageProps) {
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

export default async function DownloadsPage({ searchParams }: DownloadsPageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DownloadsData searchParams={searchParams} />
    </Suspense>
  );
}