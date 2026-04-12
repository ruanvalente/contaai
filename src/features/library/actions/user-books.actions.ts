'use server'

import { UserBook } from "@/server/domain/entities/user-book.entity";
import { getSupabaseServerClient } from "@/utils/supabase/server";

type UserBookRow = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string;
  content: string | null;
  content_url: string | null;
  status: "draft" | "published";
  reading_status: "none" | "reading" | "completed";
  reading_progress: number;
  category: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

function mapToUserBook(row: UserBookRow): UserBook {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url || undefined,
    coverColor: row.cover_color,
    content: row.content || undefined,
    contentUrl: row.content_url || undefined,
    status: row.status,
    readingStatus: row.reading_status,
    readingProgress: row.reading_progress,
    category: row.category as UserBook["category"],
    wordCount: row.word_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    publishedAt: row.published_at ? new Date(row.published_at) : undefined,
  };
}

export type UserBookFilter = "my-stories" | "reading" | "completed";

export async function getUserBooksAction(
  type: UserBookFilter
): Promise<UserBook[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase
      .from("user_books")
      .select("*")
      .eq("user_id", user.id);

    switch (type) {
      case "my-stories":
        query = query.in("status", ["draft", "published"]);
        break;
      case "reading":
        query = query.eq("reading_status", "reading");
        break;
      case "completed":
        query = query.eq("reading_status", "completed");
        break;
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching user books:", error);
      return [];
    }

    return (data || []).map(mapToUserBook);
  } catch (err) {
    console.error("Error in getUserBooksAction:", err);
    return [];
  }
}

export async function getUserBooksByIdAction(userId: string): Promise<UserBook[]> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user books:", error);
      return [];
    }

    return (data || []).map(mapToUserBook);
  } catch (err) {
    console.error("Error in getUserBooksByIdAction:", err);
    return [];
  }
}