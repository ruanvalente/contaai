import { getDashboardBooks } from "@/features/book-dashboard/actions/user-books.actions";
import { DiscoverPageWrapper } from "@/features/discovery/pages/discover-page-wrapper";

export default async function Page() {
  const books = await getDashboardBooks();

  return <DiscoverPageWrapper initialBooks={books} />;
}