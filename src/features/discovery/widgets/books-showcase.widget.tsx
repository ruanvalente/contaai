"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container.ui";
import { BookCard } from "@/shared/ui/book-card.ui";
import { getPublicBooksAction } from "@/features/public-books/actions/public-books.actions";
import type { PublicBookListItem } from "@/features/public-books/types/public-books.types";
import type { Category } from "@/server/domain/entities/book.entity";
import { motion } from "framer-motion";

const CATEGORIES: Category[] = ["All", "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography"];

export function BooksShowcase() {
  const [books, setBooks] = useState<PublicBookListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBooks() {
      setIsLoading(true);
      try {
        const filters = selectedCategory === "All" ? { limit: 20 } : { category: selectedCategory, limit: 20 };
        const result = await getPublicBooksAction(filters);
        if (mounted) {
          setBooks(result.books);
        }
      } catch (error) {
        console.error("Failed to load books:", error);
        if (mounted) {
          setBooks([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  return (
    <section className="py-20 bg-primary-200 relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
            Obras em Destaque
          </h2>
          <p className="text-gray-700 max-w-xl mx-auto">
            Explore as contribuições mais recentes da nossa comunidade literária
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-accent-500 text-white"
                    : "bg-primary-100 text-gray-700 hover:bg-primary-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 animate-pulse">
                <div className="w-32 sm:w-40">
                  <div className="bg-gray-300 rounded-lg w-full aspect-[2/3]" />
                  <div className="mt-2 h-4 bg-gray-300 rounded w-3/4" />
                  <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8 px-4 scrollbar-hide">
            {books.slice(0, 12).map((book, index) => (
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
                    isFeatured={index < 3}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCategory === "All" 
                ? "Nenhum livro encontrado" 
                : `Nenhum livro encontrado em ${selectedCategory}`}
            </p>
          </div>
        )}

        {books.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-full font-medium hover:bg-accent-600 transition-colors"
            >
              Ver todos os livros
              <span>→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}