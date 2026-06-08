"use server";

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseAuthorFollowRepository } from "@/server/infrastructure/database/supabase-author-follow.repository";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";

const authorFollowRepository = new SupabaseAuthorFollowRepository();

export async function followAuthor(
  authorName: string,
  sessionId?: string,
): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId && !sessionId) {
      return failure("INVALID_SESSION", "Sessão inválida");
    }

    const ok = await authorFollowRepository.follow(authorName, userId, sessionId);
    if (!ok) {
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

    if (!userId && !sessionId) {
      return failure("NOT_AUTHENTICATED", "Faça login para deixar de seguir");
    }

    const ok = await authorFollowRepository.unfollow(authorName, userId, sessionId);
    if (!ok) {
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
  const authors = await authorFollowRepository.getFollowedAuthors(userId, sessionId);
  return authors.map((a) => a.authorName);
}
