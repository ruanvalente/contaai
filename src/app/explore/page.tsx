import { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/shared/ui/container.ui";
import { getPublicBooksAction } from "@/features/public-books/actions/public-books.actions";
import type { Category } from "@/server/domain/entities/book.entity";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "Explorar Livros | Conta.AI",
  description: "Descubra todos os livros publicados em nossa plataforma.",
};

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  await connection();
  const { category, page } = await searchParams;
  const selectedCategory = (category as Category) || "All";
  const currentPage = parseInt(page || "1", 10);

  const result = await getPublicBooksAction({
    category: selectedCategory === "All" ? undefined : selectedCategory,
    page: currentPage,
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-primary-200">
      <section className="py-20">
        <Container>
          <ExploreClient
            books={result.books}
            totalPages={result.totalPages}
            currentPage={currentPage}
            selectedCategory={selectedCategory}
          />
        </Container>
      </section>
    </main>
  );
}