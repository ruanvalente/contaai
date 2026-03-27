"use client";

import { memo } from "react";
import { BookCard } from "./book-card";

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  rating: number;
};

type BookGridProps = {
  books: Book[];
  onBookClick?: (id: string) => void;
  className?: string;
};

const BookGridItem = memo(function BookGridItem({
  book,
  onClick,
}: {
  book: Book;
  onClick?: (id: string) => void;
}) {
  return (
    <BookCard
      id={book.id}
      title={book.title}
      author={book.author}
      coverUrl={book.coverUrl}
      coverColor={book.coverColor}
      rating={book.rating}
      onClick={onClick}
    />
  );
});

export const BookGrid = memo(function BookGrid({
  books,
  onBookClick,
  className = "",
}: BookGridProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}
    >
      {books.map((book) => (
        <BookGridItem key={book.id} book={book} onClick={onBookClick} />
      ))}
    </div>
  );
});

type EmptyStateProps = {
  message?: string;
  searchQuery?: string;
};

export function EmptyState({
  message = "Nenhuma história encontrada",
  searchQuery,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {message}
        {searchQuery ? ` para "${searchQuery}"` : ""}.
      </p>
    </div>
  );
}
