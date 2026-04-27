"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container.ui";
import { BookCard } from "@/shared/ui/book-card.ui";
import { motion } from "framer-motion";

interface FeaturedBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  rating?: number;
}

export function BookCarousel() {
  const [books, setBooks] = useState<FeaturedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedBooks() {
      try {
        const { getFeaturedPublicBooksAction } = await import(
          "@/features/public-books/actions/public-books.actions"
        );
        const data = await getFeaturedPublicBooksAction(8);
        setBooks(data);
      } catch (error) {
        console.error("Failed to load featured books:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeaturedBooks();
  }, []);

  // Fallback data if no books from database
  const displayBooks = books.length > 0 ? books : [
    { id: "1", title: "O último suspiro", author: "Maria Silva", coverColor: "#8B4513" },
    { id: "2", title: "Noites de luar", author: "João Pedro", coverColor: "#2F4F4F" },
    { id: "3", title: "Fragmentos", author: "Ana Clara", coverColor: "#800020" },
    { id: "4", title: "Travessias", author: "Ricardo Borges", coverColor: "#1E3A5F" },
    { id: "5", title: "Sinais de fumaça", author: "Carla Mendes", coverColor: "#4A4A4A" },
  ];

  return (
    <section className="py-20 bg-primary-200 relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
            Obras em Destaque
          </h2>
          <p className="text-gray-700 max-w-xl mx-auto">
            Explore as contribuições mais recentes da nossa comunidade literária
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8 px-4 scrollbar-hide">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="shrink-0 animate-pulse"
                >
                  <div className="w-32 sm:w-40">
                    <div className="bg-gray-300 rounded-lg w-full aspect-[2/3]" />
                    <div className="mt-2 h-4 bg-gray-300 rounded w-3/4" />
                    <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            : displayBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="shrink-0"
                >
                  <Link href={`/book/${book.id}`}>
                    <BookCard
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl}
                      coverColor={book.coverColor}
                      rating={book.rating}
                      isFeatured={index === 2}
                    />
                  </Link>
                </motion.div>
              ))}
        </div>
      </Container>
    </section>
  );
}
