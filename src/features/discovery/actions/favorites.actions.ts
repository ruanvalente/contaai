'use server'

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseFavoriteRepository } from "@/server/infrastructure/database";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";

const favoriteRepository = new SupabaseFavoriteRepository();

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

export async function addToFavorites(
  bookId: string,
  sessionId?: string
): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserIdOptional();

    const ok = await favoriteRepository.add(
      userId ? userId : (sessionId || `anonymous-${Math.random().toString(36).substring(7)}`), 
      { id: bookId }
    );

    return ok ? success(undefined) : failure("ADD_FAVORITE_FAILED", "Erro ao adicionar aos favoritos");
  } catch (err) {
    console.error("Error in addToFavorites:", err);
    return failure("ADD_FAVORITE_ERROR", "Erro interno. Tente novamente.");
  }
}

export async function removeFromFavorites(
  bookId: string,
  sessionId?: string
): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserIdOptional();
    
    if (!userId && !sessionId) {
      return failure("NOT_AUTHENTICATED", "Faça login para remover favoritos");
    }
    
    const ok = await favoriteRepository.remove(
      userId ? userId : sessionId!,
      bookId
    );

    return ok ? success(undefined) : failure("REMOVE_FAVORITE_FAILED", "Erro ao remover dos favoritos");
  } catch (err) {
    console.error("Error in removeFromFavorites:", err);
    return failure("REMOVE_FAVORITE_ERROR", "Erro interno. Tente novamente.");
  }
}

export async function getUserFavorites(sessionId?: string): Promise<UserFavorite[]> {
  try {
    const userId = await getCurrentUserIdOptional();
    
    if (userId) {
      return favoriteRepository.getByUser(userId);
    } else if (sessionId) {
      return favoriteRepository.getByUser(sessionId);
    }
    
    return [];
  } catch (err) {
    console.error("Error in getUserFavorites:", err);
    return [];
  }
}

export async function isBookFavorited(bookId: string, sessionId?: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserIdOptional();
    
    if (userId) {
      return favoriteRepository.isFavorited(userId, bookId);
    } else if (sessionId) {
      return favoriteRepository.isFavorited(sessionId, bookId);
    }
    
    return false;
  } catch {
    return false;
  }
}
