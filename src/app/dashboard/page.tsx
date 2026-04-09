import { getCachedBooks } from "@/features/book-dashboard/server/cached-queries";
import { DiscoverPageWrapper } from "@/features/discovery/presentation/pages/discover-page-wrapper";

export default async function Page() {
  const books = await getCachedBooks();

  return <DiscoverPageWrapper initialBooks={books} />;
}
