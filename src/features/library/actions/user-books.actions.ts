'use server'

import { UserBook } from "@/server/domain/entities/user-book.entity";

export type UserBookFilter = "my-stories" | "reading" | "completed";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseUserBookRepository } from "@/server/infrastructure/database";

const userBookRepository = new SupabaseUserBookRepository();

export async function getUserBooksAction(
  type: UserBookFilter
): Promise<UserBook[]> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return [];
    }

    return userBookRepository.getByUserId(userId, type);
  } catch (err) {
    console.error("Error in getUserBooksAction:", err);
    return [];
  }
}

export async function getUserBooksByIdAction(userId: string): Promise<UserBook[]> {
  try {
    return userBookRepository.getByUserId(userId, "my-stories");
  } catch (err) {
    console.error("Error in getUserBooksByIdAction:", err);
    return [];
  }
}