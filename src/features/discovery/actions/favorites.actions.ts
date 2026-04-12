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
  bookCategory?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const book = {
      id: bookId,
      title: bookTitle,
      author: bookAuthor,
      coverColor: bookCoverColor || "#8B4513",
      coverUrl: bookCoverUrl,
      category: bookCategory || "Drama",
    };

    const success = await favoriteRepository.add(userId, book);

    return success ? { success: true } : { success: false, error: "Erro ao adicionar aos favoritos" };
  } catch (err) {
    console.error("Error in addToFavorites:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function removeFromFavorites(
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await favoriteRepository.remove(userId, bookId);

    return success ? { success: true } : { success: false, error: "Erro ao remover dos favoritos" };
  } catch (err) {
    console.error("Error in removeFromFavorites:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function getUserFavorites(): Promise<UserFavorite[]> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return [];
    }

    return favoriteRepository.getByUser(userId);
  } catch (err) {
    console.error("Error in getUserFavorites:", err);
    return [];
  }
}

export async function isBookFavorited(bookId: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return false;
    }

    return favoriteRepository.isFavorited(userId, bookId);
  } catch {
    return false;
  }
}