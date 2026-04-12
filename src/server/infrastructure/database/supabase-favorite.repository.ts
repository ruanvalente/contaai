import { revalidatePath } from "next/cache";
import { IFavoriteRepository, UserFavorite, FavoriteBook } from "@/server/domain/repositories/favorite.repository";
import { getSupabaseServerClient } from "@/utils/supabase/server";

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

export class SupabaseFavoriteRepository implements IFavoriteRepository {
  async add(
    userId: string,
    book: FavoriteBook
  ): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient();

      const { error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: userId,
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
          book_cover_color: book.coverColor,
          book_cover_url: book.coverUrl,
          book_category: book.category,
        });

      if (error) {
        if (error.code === "23505") {
          return true;
        }
        console.error("Error adding to favorites:", error);
        return false;
      }

      revalidatePath("/dashboard/favorites");
      revalidatePath("/dashboard");
      return true;
    } catch (err) {
      console.error("Error in add:", err);
      return false;
    }
  }

  async remove(userId: string, bookId: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient();

      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId);

      if (error) {
        console.error("Error removing from favorites:", error);
        return false;
      }

      revalidatePath("/dashboard/favorites");
      revalidatePath("/dashboard");
      return true;
    } catch (err) {
      console.error("Error in remove:", err);
      return false;
    }
  }

  async getByUser(userId: string): Promise<UserFavorite[]> {
    try {
      const supabase = await getSupabaseServerClient();

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
      console.error("Error in getByUser:", err);
      return [];
    }
  }

  async isFavorited(userId: string, bookId: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient();

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
}