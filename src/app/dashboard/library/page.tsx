import { Suspense } from "react";
import { LibraryContent } from "@/features/book-dashboard";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

async function LibraryData() {
  return <LibraryContent />;
}

export default async function LibraryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LibraryData />
    </Suspense>
  );
}
