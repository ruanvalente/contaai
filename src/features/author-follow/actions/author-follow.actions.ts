'use server';

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export type AuthorFollowResult =
  | { success: boolean; error?: string }
  | { success: false; error: string };

export async function followAuthor(authorName: string): Promise<AuthorFollowResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("author_follow").insert({
      user_id: userId,
      author_name: authorName,
    });

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

export async function unfollowAuthor(authorName: string): Promise<AuthorFollowResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("author_follow")
      .delete()
      .eq("user_id", userId)
      .eq("author_name", authorName);

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

export async function getFollowedAuthorsByUser(userId: string): Promise<string[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("author_follow")
    .select("author_name")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching followed authors:", error);
    return [];
  }

  return data.map((row) => row.author_name);
}