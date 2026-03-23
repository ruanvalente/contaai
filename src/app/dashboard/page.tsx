import { getBooksAction } from "@/features/book-dashboard/actions/books.actions";
import { DiscoverPageWrapper } from "@/features/discovery/pages/discover-page-wrapper";

export const dynamic = "force-dynamic";

export default async function Page() {
  const books = await getBooksAction();

  return <DiscoverPageWrapper initialBooks={books} />;
}
