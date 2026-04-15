"use client";

import { Book } from "@/server/domain/entities/book.entity";
import { DiscoverPage } from "./discover.page";

type DiscoverPageWrapperProps = {
  initialBooks: Book[];
}

export function DiscoverPageWrapper({ initialBooks }: DiscoverPageWrapperProps) {
  return <DiscoverPage initialBooks={initialBooks} />;
}
