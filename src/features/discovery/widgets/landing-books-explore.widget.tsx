"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container.ui";
import { PublicBookGrid } from "@/features/public-books/ui/public-book-grid.ui";
import { CategoryFilter } from "@/features/public-books/ui/category-filter.ui";
import { getPublicBooksAction } from "@/features/public-books/actions/public-books.actions";
import type { PublicBookListItem } from "@/features/public-books/types/public-books.types";
import type { Category } from "@/server/domain/entities/book.entity";
import { motion } from "framer-motion";

export function LandingBooksExplore() {
  const [books, setBooks] = useState<PublicBookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true);
      try {
        const result = await getPublicBooksAction({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          limit: 20,
        });
        setBooks(result.books);
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, [selectedCategory]);

  return (
    <section id="explore" className="py-20 bg-primary-100">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
            Explore Nossos Livros
          </h2>
          <p className="text-gray-700 max-w-xl mx-auto">
            Descubra histórias incríveis de autores da nossa comunidade
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <PublicBookGrid
          books={books}
          isLoading={isLoading}
          emptyMessage="Nenhum livro encontrado nesta categoria"
        />

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