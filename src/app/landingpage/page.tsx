import LandingPage from "@/features/discovery/pages/landing.page";
import { getFeaturedPublicBooksAction } from "@/features/public-books/actions/public-books.actions";

export default async function LandingPageRoute() {
  const books = await getFeaturedPublicBooksAction(20);
  return <LandingPage initialBooks={books} />;
}