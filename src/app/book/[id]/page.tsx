import { Suspense, use } from "react";
import { BookPageClient } from "./book-page-client";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function BookContent({ params }: { params: PageProps["params"] }) {
  const { id } = use(params);
  return <BookPageClient bookId={id} />;
}

export default async function BookPage(props: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BookContent params={props.params} />
    </Suspense>
  );
}
