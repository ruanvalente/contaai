"use client";

import { type ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { BookCard } from "@/shared/ui/book-card.ui";

type BookCardWidgetProps = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  rating?: number;
  isFeatured?: boolean;
  onClick?: (id: string) => void;
  className?: string;
};

export function BookCardWidget({
  id,
  title,
  author,
  coverUrl,
  coverColor,
  rating,
  isFeatured = false,
  onClick,
  className,
}: BookCardWidgetProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <motion.button
      type="button"
      className={cn(
        "cursor-pointer text-left bg-transparent border-none p-0",
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick?.(id)}
      onKeyDown={handleKeyDown}
      aria-label={`Ver detalhes do livro ${title} de ${author}`}
    >
      <BookCard
        id={id}
        title={title}
        author={author}
        coverUrl={coverUrl}
        coverColor={coverColor}
        rating={rating}
        isFeatured={isFeatured}
      />
    </motion.button>
  );
}