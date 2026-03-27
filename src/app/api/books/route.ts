import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: books, error: booksError } = await supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .order("created_at", { ascending: false });

    if (booksError) {
      console.error("Error fetching books:", booksError);
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }

    const { data: userBooks, error: userBooksError } = await supabase
      .from("user_books")
      .select("id, title, author, cover_url, cover_color, category, status, word_count, created_at")
      .eq("status", "published");

    if (userBooksError) {
      console.error("Error fetching user books:", userBooksError);
    }

    const validCategories = ["Drama", "Fantasy", "Sci-Fi", "Business", "Education", "Geography"];

    const formattedBooks = (books || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      description: book.description || "",
      category: validCategories.includes(book.category) ? book.category : "Drama",
      pages: book.pages || 0,
      rating: book.rating || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: book.review_count || 0,
      createdAt: book.created_at,
    }));

    const publishedUserBooks = (userBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      description: "",
      category: validCategories.includes(book.category) ? book.category : "Drama",
      pages: Math.ceil((book.word_count || 0) / 500),
      rating: 0,
      ratingCount: 0,
      reviewCount: 0,
      createdAt: book.created_at,
    }));

    const allBooks = [...formattedBooks, ...publishedUserBooks];

    return NextResponse.json(allBooks);
  } catch (err) {
    console.error("Error in books API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
