"use client";

import { Suspense, use } from "react";
import { BookEditor } from "@/features/book-dashboard/widgets/book-editor.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function EditorContent({ params }: { params: PageProps["params"] }) {
  const { id } = use(params);
  return <BookEditor bookId={id} />;
}

export default function EditorPage(props: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditorContent params={props.params} />
    </Suspense>
  );
}
