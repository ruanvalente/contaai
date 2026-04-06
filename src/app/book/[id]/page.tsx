import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { BookPageClient } from "./book-page-client";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getBookData(bookId: string) {
  const supabase = await getSupabaseServerClient();

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
    return {
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
      isUserBook: true,
    };
  }

  if (regularBookRes.data) {
    const data = regularBookRes.data;
    const validCategories = ["Drama", "Fantasia", "Ficção", "Romance", "Suspense", "Terror", "Aventura", "Comédia", "Drama", "Ficção Científica", "Fantasia", "Mistério", "Não Ficção", "Poesia", "Conto", "Biografia", "História", "Filosofia", "Autoajuda", "Negócios"];
    const category = validCategories.includes(data.category) 
      ? data.category 
      : "Drama";
    return {
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
      isUserBook: false,
    };
  }

  return null;
}

function BookContent({ params }: { params: PageProps["params"] }) {
  const { id } = use(params);
  return <BookPageClient bookId={id} />;
}

export default async function BookPage(props: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BookContent params={props.params} />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
