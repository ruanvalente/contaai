"use server";

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";

export async function followAuthor(
  authorName: string,
  sessionId?: string,
): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    const supabase = await getSupabaseServerClient();

    const insertData: Record<string, unknown> = {
      author_name: authorName,
      created_at: new Date().toISOString(),
    };

    if (userId) {
      insertData.user_id = userId;
    } else if (sessionId) {
      insertData.session_id = sessionId;
      insertData.user_id = null;
    } else {
      return failure("INVALID_SESSION", "Sessão inválida");
    }

    const { error } = await supabase.from("author_follow").insert(insertData);

    if (error) {
      if (error.code === "23505") {
        return failure("ALREADY_FOLLOWING", "Você já segue este autor");
      }
      console.error("Error in followAuthor:", error);
      return failure("FOLLOW_ERROR", "Erro ao seguir autor");
    }

    return success(undefined);
  } catch (err) {
    console.error("Error in followAuthor:", err);
    return failure("FOLLOW_ERROR", "Erro interno");
  }
}

export async function unfollowAuthor(
  authorName: string,
  sessionId?: string,
): Promise<ActionResult> {
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
      query = supabase
        .from("author_follow")
        .delete()
        .eq("author_name", authorName)
        .eq("session_id", sessionId)
        .is("user_id", null);
    } else {
      return failure("NOT_AUTHENTICATED", "Faça login para deixar de seguir");
    }

    const { error } = await query;

    if (error) {
      console.error("Error in unfollowAuthor:", error);
      return failure("UNFOLLOW_ERROR", "Erro ao deixar de seguir");
    }

    return success(undefined);
  } catch (err) {
    console.error("Error in unfollowAuthor:", err);
    return failure("UNFOLLOW_ERROR", "Erro interno");
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
