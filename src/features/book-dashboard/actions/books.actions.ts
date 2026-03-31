"use server";

import { revalidatePath } from "next/cache";
import { Book } from "@/features/book-dashboard/types/book.types";
import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";
import { formatBook } from "@/lib/books/format-book";

export async function getBooksAction(): Promise<Book[]> {
  try {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
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
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
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
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .or(`title.ilike.*${query}*,author.ilike.*${query}*,category.ilike.*${query}*`)
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
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
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

export async function invalidateBooks(): Promise<void> {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/category");
}
