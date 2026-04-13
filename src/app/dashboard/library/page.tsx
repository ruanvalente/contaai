import { Suspense } from "react";
import { LibraryContent } from "@/features/library/widgets/library-content.widget";
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
