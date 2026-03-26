import { getCachedBooks } from "@/features/book-dashboard/data/cached-books";
import { DiscoverPageWrapper } from "@/features/discovery/pages/discover-page-wrapper";

export default async function Page() {
  const books = await getCachedBooks();

  return <DiscoverPageWrapper initialBooks={books} />;
}
