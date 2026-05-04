'use server'

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseFavoriteRepository } from "@/server/infrastructure/database";

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
  bookTitle: string,
  bookAuthor: string,
  bookCoverColor?: string,
  bookCoverUrl?: string,
  bookCategory?: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserIdOptional();
    
    const book = {
      id: bookId,
      title: bookTitle,
      author: bookAuthor,
      coverColor: bookCoverColor || "#8B4513",
      coverUrl: bookCoverUrl,
      category: bookCategory || "Drama",
    };

    const success = await favoriteRepository.add(
      userId ? userId : (sessionId || `anonymous-${Math.random().toString(36).substring(7)}`), 
      book
    );

    return success ? { success: true } : { success: false, error: "Erro ao adicionar aos favoritos" };
  } catch (err) {
    console.error("Error in addToFavorites:", err);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}

export async function removeFromFavorites(
  bookId: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserIdOptional();
    
    if (!userId && !sessionId) {
      return { success: false, error: "Faça login para remover favoritos" };
    }
    
    const success = await favoriteRepository.remove(
      userId ? userId : sessionId!,
      bookId
    );

    return success ? { success: true } : { success: false, error: "Erro ao remover dos favoritos" };
  } catch (err) {
    console.error("Error in removeFromFavorites:", err);
    return { success: false, error: "Erro interno. Tente novamente." };
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