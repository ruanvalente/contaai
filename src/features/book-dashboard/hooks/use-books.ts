"use client";

import { useState, useEffect, useCallback } from "react";
import { Book, Category } from "../types/book.types";
import { mockBooks, filterBooksByCategory, searchBooks } from "../data/books";
import { supabase } from "@/shared/config/supabase";

interface UseBooksReturn {
  books: Book[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  filteredBooks: (category: Category, searchQuery?: string) => Book[];
}

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

export function useBooks(): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_SUPABASE) {
        const { data, error: supabaseError } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;

        const formattedBooks: Book[] = (data || []).map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.cover_url,
          coverColor: book.cover_color || "#8B4513",
          description: book.description || "",
          category: book.category,
          pages: book.pages || 0,
          rating: book.rating || 0,
          ratingCount: book.rating_count || 0,
          reviewCount: book.review_count || 0,
          createdAt: new Date(book.created_at),
        }));

        setBooks(formattedBooks);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setBooks(mockBooks);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch books"));
      setBooks(mockBooks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const refetch = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useCallback(
    (category: Category, searchQuery?: string): Book[] => {
      let result = filterBooksByCategory(books, category);

      if (searchQuery && searchQuery.trim()) {
        result = searchBooks(result, searchQuery);
      }

      return result;
    },
    [books],
  );

  return {
    books,
    isLoading,
    error,
    refetch,
    filteredBooks,
  };
}
