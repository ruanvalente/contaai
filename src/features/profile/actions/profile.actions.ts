"use server";

import { User, UpdateUserInput, UserResult } from "@/server/domain/entities/user.entity";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseUserRepository } from "@/server/infrastructure/database";

const userRepository = new SupabaseUserRepository();

export async function getUserProfile(): Promise<User | null> {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) {
      return null;
    }
    return userRepository.getById(userId);
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

export async function updateUserProfile(
  data: UpdateUserInput
): Promise<UserResult> {
  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado." };
    }

    if (data.name !== undefined && data.name.length > 100) {
      return { success: false, error: "Nome deve ter no máximo 100 caracteres." };
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      return { success: false, error: "Bio deve ter no máximo 500 caracteres." };
    }

    const user = await userRepository.update(userId, data);

    return { success: true, user };
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    return { success: false, error: "Erro interno ao atualizar perfil." };
  }
}
