"use server";

import type { User } from "@/server/domain/entities/user.entity";
import type { ActionResult } from "@/shared/types/action-result";
import { success, failure } from "@/shared/types/action-result";

export type UpdateProfileParams = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  avatarFile?: File;
};

export async function updateProfileAction(
  params: UpdateProfileParams,
): Promise<ActionResult<User>> {
  const { updateUserProfile } = await import("./profile.actions");
  const { uploadAvatar } = await import("./upload-avatar.action");

  const { name, bio, avatarUrl, avatarFile } = params;

  if (name !== undefined && name.length > 100) {
    return failure("INVALID_NAME", "Nome deve ter no máximo 100 caracteres.");
  }

  if (bio !== undefined && bio.length > 500) {
    return failure("INVALID_BIO", "Bio deve ter no máximo 500 caracteres.");
  }

  let finalAvatarUrl = avatarUrl;

  if (avatarFile) {
    const { getUserProfile } = await import("./profile.actions");
    const profile = await getUserProfile();

    if (!profile) {
      return failure("NOT_AUTHENTICATED", "Usuário não autenticado.");
    }

    const uploadResult = await uploadAvatar(avatarFile, profile.id);

    if (!uploadResult.ok) {
      return failure("UPLOAD_FAILED", uploadResult.error.message || "Erro ao fazer upload da imagem.");
    }

    finalAvatarUrl = uploadResult.data.url;
  }

  return await updateUserProfile({
    name: name || undefined,
    bio: bio || undefined,
    avatarUrl: finalAvatarUrl || undefined,
  });
}
