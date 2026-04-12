"use server";

import { User, UpdateUserInput, UserResult } from "@/domain/entities/user.entity";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export async function getUserProfile(): Promise<User | null> {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    }

    const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || null;
    
    const profileData = profile || {
      id: user.id,
      name: fallbackName,
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (profile && !profile.name && fallbackName) {
      profileData.name = fallbackName;
    }

    return {
      id: profileData.id,
      name: profileData.name,
      email: user.email || "",
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

export async function updateUserProfile(
  data: UpdateUserInput
): Promise<UserResult> {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    if (data.name !== undefined && data.name.length > 100) {
      return { success: false, error: "Nome deve ter no máximo 100 caracteres." };
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      return { success: false, error: "Bio deve ter no máximo 500 caracteres." };
    }

    const updates: Record<string, string | null> = {};

    if (data.name !== undefined) {
      updates.name = data.name || null;
    }

    if (data.bio !== undefined) {
      updates.bio = data.bio || null;
    }

    if (data.avatarUrl !== undefined) {
      updates.avatar_url = data.avatarUrl || null;
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        ...updates,
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Erro ao atualizar perfil." };
    }

    return {
      success: true,
      user: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: user.email || "",
        avatarUrl: updatedProfile.avatar_url,
        bio: updatedProfile.bio,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
      },
    };
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    return { success: false, error: "Erro interno ao atualizar perfil." };
  }
}
