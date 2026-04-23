import { Suspense } from "react";
import { LibraryContent } from "@/features/library/widgets/library-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

export async function generateMetadata() {
  return { title: "Minha Biblioteca | ContaAI" };
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LibraryContent />
    </Suspense>
  );
}
