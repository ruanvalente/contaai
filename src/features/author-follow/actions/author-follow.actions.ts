"use server";

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export type AuthorFollowResult =
  | { success: boolean; error?: string }
  | { success: false; error: string };

export async function followAuthor(
  authorName: string,
  sessionId?: string,
): Promise<AuthorFollowResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    const supabase = await getSupabaseServerClient();

    const insertData: any = {
      author_name: authorName,
      created_at: new Date().toISOString(),
    };

    if (userId) {
      insertData.user_id = userId;
    } else if (sessionId) {
      insertData.session_id = sessionId;
      insertData.user_id = null;
    } else {
      return { success: false, error: "Sessão inválida" };
    }

    const { error } = await supabase.from("author_follow").insert(insertData);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Você já segue este autor" };
      }
      console.error("Error in followAuthor:", error);
      return { success: false, error: "Erro ao seguir autor" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in followAuthor:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function unfollowAuthor(
  authorName: string,
  sessionId?: string,
): Promise<AuthorFollowResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    const supabase = await getSupabaseServerClient();

    let query = supabase
      .from("author_follow")
      .delete()
      .eq("author_name", authorName);

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      // For anonymous, use session_id
      query = supabase
        .from("author_follow")
        .delete()
        .eq("author_name", authorName)
        .eq("session_id", sessionId)
        .is("user_id", null);
    } else {
      return { success: false, error: "Faça login para deixar de seguir" };
    }

    const { error } = await query;

    if (error) {
      console.error("Error in unfollowAuthor:", error);
      return { success: false, error: "Erro ao deixar de seguir" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in unfollowAuthor:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function getFollowedAuthorsByUser(
  userId?: string,
  sessionId?: string,
): Promise<string[]> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("author_follow").select("author_name");

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId).is("user_id", null);
  } else {
    return [];
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching followed authors:", error);
    return [];
  }

  return data.map((row) => row.author_name);
}
