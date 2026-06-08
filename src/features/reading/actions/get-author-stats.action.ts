'use server';

import { SupabaseAuthorFollowRepository } from "@/server/infrastructure/database/supabase-author-follow.repository";
import { SupabaseFavoriteRepository } from "@/server/infrastructure/database/supabase-favorite.repository";

const authorFollowRepository = new SupabaseAuthorFollowRepository();
const favoriteRepository = new SupabaseFavoriteRepository();

export async function getAuthorStats(authorName: string, bookId?: string) {
  const [followersCount, favoritesCount] = await Promise.all([
    authorFollowRepository.countFollowers(authorName),
    bookId ? favoriteRepository.countByBookId(bookId) : Promise.resolve(0),
  ]);

  return { followersCount, favoritesCount };
}

export async function getBookStats(bookId: string) {
  const favoritesCount = await favoriteRepository.countByBookId(bookId);
  return { favoritesCount };
}
