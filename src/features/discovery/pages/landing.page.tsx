"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header as LandingHeader } from "@/features/discovery/widgets/landing-header.widget";
import { Hero as LandingHero } from "@/features/discovery/widgets/landing-hero.widget";
import { BooksShowcase as LandingBooksShowcase } from "@/features/discovery/widgets/books-showcase.widget";
import { Container } from "@/shared/ui/container.ui";
import { useState, useEffect, useTransition } from "react";
import { useAuthStore } from "@/shared/storage/use-auth-store";
import type { PublicBookListItem } from "@/features/public-books/types/public-books.types";
import type { Book } from "@/server/domain/entities/book.entity";
import { BookDetailsModalWidget } from "@/features/book-details/widgets/book-details-modal.widget";
import { getFeaturedPublicBooksAction } from "@/features/public-books/actions/public-books.actions";

function mapToBook(book: PublicBookListItem): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    coverColor: book.coverColor,
    rating: book.rating || 0,
    description: '',
    category: book.category,
    pages: book.pages || 0,
    ratingCount: book.ratingCount || 0,
    reviewCount: book.reviewCount || 0,
    createdAt: new Date(),
  };
}

type LandingPageProps = {
  initialBooks: PublicBookListItem[];
};

export default function LandingPage({ initialBooks }: LandingPageProps) {
  const router = useRouter();
  const { user, isInitialized, isLoading, initialize } = useAuthStore();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace('/dashboard');
    }
  }, [user, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return <main className="min-h-screen bg-primary-100" />;
  }

  const handleBookSelect = (book: PublicBookListItem) => {
    setSelectedBook(mapToBook(book));
  };

  const handleClearSelection = () => {
    setSelectedBook(null);
  };

  return (
    <main className="min-h-screen bg-primary-100">
      <LandingHeader />
      <LandingHero />
      
      <LandingBooksShowcase initialBooks={initialBooks} onBookSelect={handleBookSelect} />
      
      <section id="community" className="py-20 bg-primary-100">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
              Comunidade
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto">
              Conecte-se com outros escritores e amantes da literatura.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                title: "Fóruns de Discussão",
                desc: "Participe de conversas sobre literatura",
              },
              {
                title: "Eventos Literários",
                desc: "Workshops e encontros online",
              },
              {
                title: "Feedback entre Autores",
                desc: "Receba e ofereça críticas construtivas",
              },
              {
                title: "Desafios de Escrita",
                desc: "Participe de desafios mensais",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-accent-100 rounded-lg p-6 hover:bg-accent-100/80 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      
      <section id="contribute" className="py-20 bg-primary-200">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
              Contribua
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto mb-8">
              Compartilhe suas histórias com a comunidade. É grátis e simples.
            </p>
            <Link
              href="/register"
              className="inline-block bg-accent-500 text-white px-8 py-4 rounded-full font-medium hover:bg-accent-600 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </Container>
      </section>
      
      <footer className="py-12 bg-primary-300">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xl font-display font-bold text-gray-900">
                Conta<span className="text-accent-500">AI</span>
              </span>
              <p className="text-gray-700 text-sm mt-2">
                Compartilhando histórias desde 2026
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Termos
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Privacidade
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Contato
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700/20 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 ContaAI. Todos os direitos reservados.
            </p>
          </div>
        </Container>
      </footer>

      <BookDetailsModalWidget
        book={selectedBook}
        onClose={handleClearSelection}
      />
    </main>
  );
}