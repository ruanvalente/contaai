"use client";

import { Book } from "@/features/book-dashboard/types/book.types";
import { DiscoverPage } from "./discover.page";

type DiscoverPageWrapperProps = {
  initialBooks: Book[];
}

export function DiscoverPageWrapper({ initialBooks }: DiscoverPageWrapperProps) {
  return <DiscoverPage initialBooks={initialBooks} />;
}
