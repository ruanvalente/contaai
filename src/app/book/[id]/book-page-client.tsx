"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { BookReader } from "./book-reader";

type BookData = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor: string;
  category: string;
  createdAt: Date;
  content?: string;
  description?: string;
  pages?: number;
  rating?: number;
  ratingCount?: number;
  wordCount?: number;
  publishedAt?: Date;
};

export function BookPageClient({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<BookData | null>(null);
  const [isUserBook, setIsUserBook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      const supabase = createClient();

      const [regularBookRes, userBookRes] = await Promise.all([
        supabase
          .from("books")
          .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
          .eq("id", bookId)
          .single(),
        supabase
          .from("user_books")
          .select("id, title, author, cover_url, cover_color, category, content, word_count, created_at, published_at")
          .eq("id", bookId)
          .eq("status", "published")
          .single(),
      ]);

      if (userBookRes.data) {
        const data = userBookRes.data;
        setBook({
          id: data.id,
          title: data.title,
          author: data.author,
          coverUrl: data.cover_url || undefined,
          coverColor: data.cover_color || "#8B4513",
          category: data.category,
          createdAt: new Date(data.created_at),
          content: data.content || undefined,
          wordCount: data.word_count || 0,
          publishedAt: data.published_at ? new Date(data.published_at) : undefined,
        });
        setIsUserBook(true);
      } else if (regularBookRes.data) {
        const data = regularBookRes.data;
        const validCategories = ["Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"];
        const category = validCategories.includes(data.category) 
          ? data.category 
          : "Drama";
        setBook({
          id: data.id,
          title: data.title,
          author: data.author,
          coverUrl: data.cover_url || undefined,
          coverColor: data.cover_color || "#8B4513",
          category,
          createdAt: new Date(data.created_at),
          description: data.description || "",
          pages: data.pages || 0,
          rating: data.rating || 0,
          ratingCount: data.rating_count || 0,
        });
        setIsUserBook(false);
      }

      setIsLoading(false);
    }

    fetchBook();
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500" />
      </div>
    );
  }

  if (!book) {
    notFound();
  }

  return <BookReader book={book} isUserBook={isUserBook} />;
}
