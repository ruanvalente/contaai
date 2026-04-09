"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Book } from "@/domain/entities/book.entity";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@/features/book-dashboard/books/presentation/ui/icons.ui";

type RecommendedSectionWidgetProps = {
  books: Book[];
  onBookSelect: (book: Book) => void;
  isLoading?: boolean;
}

export function RecommendedSectionWidget({
  books,
  onBookSelect,
  isLoading = false,
}: RecommendedSectionWidgetProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 180 : 280;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-4 sm:py-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
          Recomendados para Você
        </h2>
        <div className="flex gap-4 overflow-hidden px-4 sm:px-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-[70%] sm:w-[48%] sm:max-w-70">
              <div className="animate-pulse flex flex-col items-center p-3">
                <div className="w-full aspect-2/3 bg-primary-200 rounded-xl" />
                <div className="mt-3 w-24 h-3 bg-primary-200 rounded" />
                <div className="mt-2 w-16 h-2 bg-primary-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="py-4 sm:py-6 -mx-4 sm:mx-0">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
          Recomendados para Você
        </h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white border border-primary-300 hover:bg-primary-200 transition-colors"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white border border-primary-300 hover:bg-primary-200 transition-colors"
            aria-label="Rolar para direita"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollPaddingLeft: "1rem",
        }}
      >
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="shrink-0 w-[70%] sm:w-[48%] sm:max-w-70 snap-start px-4 sm:px-0 first:pl-4 sm:first:pl-0 last:pr-4 sm:last:pr-0"
          >
            <RecommendedBookCard
              book={book}
              isFeatured={index === 0}
              onClick={() => onBookSelect(book)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RecommendedBookCard({
  book,
  onClick,
}: {
  book: Book;
  isFeatured: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className="w-full aspect-2/3 max-w-40 rounded-xl shadow-md flex flex-col items-center justify-center p-3"
        style={{ backgroundColor: book.coverColor }}
      >
        <div className="flex-1 flex items-center justify-center">
          <span className="text-white/90 font-display text-sm text-center leading-tight line-clamp-4">
            {book.title}
          </span>
        </div>
        <div className="w-full border-t border-white/20 pt-2 mt-2">
          <div className="w-6 h-1 bg-white/30 rounded mx-auto" />
        </div>
      </div>

      <div className="mt-3 text-center w-full">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 truncate">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <StarIcon className="w-3 h-3 text-warning" filled />
          <StarIcon className="w-3 h-3 text-warning" filled />
          <StarIcon className="w-3 h-3 text-warning" filled />
          <StarIcon className="w-3 h-3 text-warning" filled />
          <StarIcon className="w-3 h-3 text-gray-300" filled={false} />
          <span className="text-xs text-gray-600 ml-1">{book.rating}</span>
        </div>
      </div>
    </button>
  );
}
