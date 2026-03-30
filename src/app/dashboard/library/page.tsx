import { Suspense } from "react";
import { LibraryContent } from "@/features/book-dashboard/widgets/library-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    tab?: string;
  }>;
}

async function LibraryData() {
  return <LibraryContent />;
}

export default async function LibraryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LibraryData />
    </Suspense>
  );
}
