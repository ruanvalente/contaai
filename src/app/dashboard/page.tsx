import { getDashboardBooks } from "@/features/book-dashboard/actions/user-books.actions";
import { DiscoverPageWrapper } from "@/features/discovery/pages/discover-page-wrapper";
import { UserBook } from "@/server/domain/entities/user-book.entity";
import { Book } from "@/server/domain/entities/book.entity";

function mapUserBookToBook(userBook: UserBook): Book {
  return {
    id: userBook.id,
    title: userBook.title,
    author: userBook.author,
    coverUrl: userBook.coverUrl,
    coverColor: userBook.coverColor,
    description: "",
    category: userBook.category,
    pages: Math.ceil((userBook.wordCount || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: userBook.createdAt,
  };
}

export default async function Page() {
  const { userBooks, publishedBooks } = await getDashboardBooks();

  const userBooksAsBooks = userBooks.map(mapUserBookToBook);
  const publishedAsBooks = publishedBooks.map(mapUserBookToBook);
  const allBooks = [...userBooksAsBooks, ...publishedAsBooks];

  return <DiscoverPageWrapper initialBooks={allBooks} />;
}
