"use server";

import { UserResult } from "@/server/domain/entities/user.entity";

export type UpdateProfileParams = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  avatarFile?: File;
};

export async function updateProfileAction(
  params: UpdateProfileParams,
): Promise<UserResult> {
  const { updateUserProfile } = await import("./profile.actions");
  const { uploadAvatar } = await import("./upload-avatar.action");

  const { name, bio, avatarUrl, avatarFile } = params;

  if (name !== undefined && name.length > 100) {
    return { success: false, error: "Nome deve ter no máximo 100 caracteres." };
  }

  if (bio !== undefined && bio.length > 500) {
    return { success: false, error: "Bio deve ter no máximo 500 caracteres." };
  }

  let finalAvatarUrl = avatarUrl;

  if (avatarFile) {
    const { getUserProfile } = await import("./profile.actions");
    const profile = await getUserProfile();

    if (!profile) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const uploadResult = await uploadAvatar(avatarFile, profile.id);

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || "Erro ao fazer upload da imagem.",
      };
    }

    finalAvatarUrl = uploadResult.url;
  }

  const result = await updateUserProfile({
    name: name || undefined,
    bio: bio || undefined,
    avatarUrl: finalAvatarUrl || undefined,
  });

  return result;
}
