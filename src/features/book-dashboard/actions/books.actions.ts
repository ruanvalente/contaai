"use server";

import { revalidatePath } from "next/cache";
import { Book } from "@/features/book-dashboard/types/book.types";

type SupabaseBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  pages: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
};

function formatBook(book: SupabaseBook): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    description: book.description || "",
    category: book.category as Book["category"],
    pages: book.pages || 0,
    rating: typeof book.rating === "string" ? parseFloat(book.rating) : (book.rating || 0),
    ratingCount: book.rating_count || 0,
    reviewCount: book.review_count || 0,
    createdAt: new Date(book.created_at),
  };
}

async function getSupabaseAdmin() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}

export async function getBooksAction(): Promise<Book[]> {
  try {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error);
      return [];
    }

    return (data || []).map(formatBook);
  } catch (err) {
    console.error("Error in getBooksAction:", err);
    return [];
  }
}

export async function getBookByIdAction(id: string): Promise<Book | null> {
  try {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching book:", error);
      return null;
    }

    return formatBook(data);
  } catch (err) {
    console.error("Error in getBookByIdAction:", err);
    return null;
  }
}

export async function searchBooksAction(query: string): Promise<Book[]> {
  try {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching books:", error);
      return [];
    }

    return (data || []).map(formatBook);
  } catch (err) {
    console.error("Error in searchBooksAction:", err);
    return [];
  }
}

export async function getBooksByCategoryAction(category: string): Promise<Book[]> {
  try {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books by category:", error);
      return [];
    }

    return (data || []).map(formatBook);
  } catch (err) {
    console.error("Error in getBooksByCategoryAction:", err);
    return [];
  }
}

export async function revalidateBooksCache(path: string = "/dashboard"): Promise<void> {
  revalidatePath(path);
}
