"use client";

import { Suspense, use } from "react";
import { BookEditor } from "@/features/book-dashboard/widgets/book-editor.widget";
import type { PageProps } from "@/shared/types/next.types";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

function EditorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookEditor bookId={id} />;
}

export default function EditorPage(props: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditorContent params={props.params} />
    </Suspense>
  );
}
