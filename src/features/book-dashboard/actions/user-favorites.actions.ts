"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";

export type UserFavorite = {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverColor?: string;
  bookCoverUrl?: string;
  bookCategory?: string;
  createdAt: Date;
};

type FavoriteRow = {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover_color: string | null;
  book_cover_url: string | null;
  book_category: string | null;
  created_at: string;
};

function formatFavorite(row: FavoriteRow): UserFavorite {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    bookCoverColor: row.book_cover_color || undefined,
    bookCoverUrl: row.book_cover_url || undefined,
    bookCategory: row.book_category || undefined,
    createdAt: new Date(row.created_at),
  };
}

export async function addToFavorites(
  bookId: string,
  bookTitle: string,
  bookAuthor: string,
  bookCoverColor?: string,
  bookCoverUrl?: string,
  bookCategory?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const { error } = await supabase
      .from("user_favorites")
      .insert({
        user_id: userId,
        book_id: bookId,
        book_title: bookTitle,
        book_author: bookAuthor,
        book_cover_color: bookCoverColor,
        book_cover_url: bookCoverUrl,
        book_category: bookCategory,
      });

    if (error) {
      if (error.code === "23505") {
        return { success: true };
      }
      console.error("Error adding to favorites:", error);
      return { success: false, error: "Erro ao adicionar aos favoritos" };
    }

    revalidatePath("/dashboard/favorites");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error in addToFavorites:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function removeFromFavorites(
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) {
      console.error("Error removing from favorites:", error);
      return { success: false, error: "Erro ao remover dos favoritos" };
    }

    revalidatePath("/dashboard/favorites");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error in removeFromFavorites:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function getUserFavorites(): Promise<UserFavorite[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }

    return (data || []).map(formatFavorite);
  } catch (err) {
    console.error("Error in getUserFavorites:", err);
    return [];
  }
}

export async function isBookFavorited(bookId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient();
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch {
    return false;
  }
}
