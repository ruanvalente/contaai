"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { BookCover } from "./book-cover.ui";
import { StarRating } from "./star-rating.ui";

type BookCardProps = ComponentPropsWithoutRef<"div"> & {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  rating?: number;
  isFeatured?: boolean;
};

export const BookCard = forwardRef<HTMLDivElement, BookCardProps>(
  (
    {
      id,
      title,
      author,
      coverUrl,
      coverColor,
      rating,
      isFeatured = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col items-center text-left bg-transparent",
          isFeatured && "sm:scale-105 z-10",
          className
        )}
        {...props}
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
      </div>
    );
  }
);

BookCard.displayName = "BookCard";