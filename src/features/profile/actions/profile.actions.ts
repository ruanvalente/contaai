"use server";

import type { User } from "@/server/domain/entities/user.entity";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { SupabaseUserRepository } from "@/server/infrastructure/database";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";
import { updateProfileSchema } from "@/features/profile/schemas/profile.schema";

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
  data: Record<string, unknown>
): Promise<ActionResult<User>> {
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return failure("INVALID_INPUT", issue.message);
  }

  try {
    const userId = await getCurrentUserIdOptional();

    if (!userId) {
      return failure("NOT_AUTHENTICATED", "Usuário não autenticado.");
    }

    const user = await userRepository.update(userId, parsed.data);

    return success(user);
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    return failure("UPDATE_PROFILE_ERROR", "Erro interno ao atualizar perfil.");
  }
}
