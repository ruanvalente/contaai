import { getBooksAction } from "@/features/book-dashboard/actions/books.actions";
import { DiscoverPageWrapper } from "@/features/discovery/pages/discover-page-wrapper";

export default async function Page() {
  const books = await getBooksAction();

  return <DiscoverPageWrapper initialBooks={books} />;
}
