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
    userId: string | null,
    book: FavoriteBook
  ): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient();
      
      const insertData: any = {
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_cover_color: book.coverColor,
        book_cover_url: book.coverUrl,
        book_category: book.category,
      };
      
      // Check if it's an anonymous user (session_id format)
      if (userId && userId.startsWith('anonymous-')) {
        insertData.session_id = userId;
        insertData.user_id = null;
      } else if (userId) {
        insertData.user_id = userId;
      } else {
        console.error("Invalid user/session ID");
        return false;
      }
      
      const { error } = await supabase
        .from("user_favorites")
        .insert(insertData);

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
      
      let query = supabase
        .from("user_favorites")
        .delete()
        .eq("book_id", bookId);
      
      // Check if it's anonymous (session_id format)
      if (userId && userId.startsWith('anonymous-')) {
        query = query.eq("session_id", userId).is("user_id", null);
      } else {
        query = query.eq("user_id", userId);
      }
      
      const { error } = await query;

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
      
      let query = supabase
        .from("user_favorites")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Check if it's anonymous (session_id format)
      if (userId && userId.startsWith('anonymous-')) {
        query = query.eq("session_id", userId).is("user_id", null);
      } else {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query;

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

  async isFavorited(userId: string | null, bookId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const supabase = await getSupabaseServerClient();
      
      let query = supabase
        .from("user_favorites")
        .select("id")
        .eq("book_id", bookId)
        .single();
      
      // Check if it's anonymous (session_id format)
      if (userId.startsWith('anonymous-')) {
        query = supabase
          .from("user_favorites")
          .select("id")
          .eq("session_id", userId)
          .eq("book_id", bookId)
          .single();
      } else {
        query = supabase
          .from("user_favorites")
          .select("id")
          .eq("user_id", userId)
          .eq("book_id", bookId)
          .single();
      }
      
      const { data, error } = await query;
      
      if (error) {
        return false;
      }
      
      return !!data;
    } catch {
      return false;
    }
  }
}