"use client";

import { Book } from "@/domain/entities/book.entity";
import { DiscoverPage } from "./discover.page";

type DiscoverPageWrapperProps = {
  initialBooks: Book[];
}

export function DiscoverPageWrapper({ initialBooks }: DiscoverPageWrapperProps) {
  return <DiscoverPage initialBooks={initialBooks} />;
}
