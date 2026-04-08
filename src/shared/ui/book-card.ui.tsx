"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { BookCover } from "./book-cover";
import { StarRating } from "./star-rating";

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  rating?: number;
  isFeatured?: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

export function BookCard({
  id,
  title,
  author,
  coverUrl,
  coverColor,
  rating,
  isFeatured = false,
  onClick,
  className = "",
}: BookCardProps) {
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
        "relative cursor-pointer text-left bg-transparent border-none p-0",
        isFeatured && "sm:scale-105 z-10",
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick?.(id)}
      onKeyDown={handleKeyDown}
      aria-label={`Ver detalhes do livro ${title} de ${author}`}
    >
      <div className="flex flex-col items-center">
        <BookCover
          title={title}
          coverUrl={coverUrl}
          coverColor={coverColor}
          size={isFeatured ? "lg" : "md"}
          className="shadow-lg"
        />

        <div className="mt-2 sm:mt-3 text-center w-full max-w-28 sm:max-w-40">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{author}</p>
          {rating !== undefined && (
            <div className="mt-1 sm:mt-2 flex justify-center">
              <StarRating rating={rating} size="sm" showValue={false} />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
