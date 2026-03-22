"use client";

import { useState } from "react";
import { Book, Category, CATEGORIES } from "@/features/book-dashboard/types/book.types";
import { BookCard } from "../ui/book-card.ui";
import { Tabs } from "@/shared/ui/tabs";

interface CategoriesSectionWidgetProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  isLoading?: boolean;
}

export function CategoriesSectionWidget({
  books,
  onBookSelect,
  isLoading = false,
}: CategoriesSectionWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredBooks =
    activeCategory === "All"
      ? books
      : books.filter((book) => book.category === activeCategory);

  if (isLoading) {
    return (
      <section className="py-4 sm:py-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
          Explorar por Categoria
        </h2>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-4 sm:px-0">
          {CATEGORIES.slice(0, 5).map((_, i) => (
            <div key={i} className="animate-pulse w-16 sm:w-20 h-8 sm:h-10 bg-primary-200 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse flex flex-col items-center p-2">
              <div className="w-full aspect-[2/3] max-w-[140px] bg-primary-200 rounded-lg" />
              <div className="mt-2 w-20 h-3 bg-primary-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
        Explorar por Categoria
      </h2>

      <Tabs
        tabs={CATEGORIES}
        activeTab={activeCategory}
        onTabChange={(tab) => setActiveCategory(tab as Category)}
        className="mb-6 px-4 sm:px-0"
      />

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhum livro encontrado nesta categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-0">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={onBookSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
