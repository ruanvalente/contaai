"use server";

import { Profile, UpdateProfileInput, ProfileResult } from "@/features/profile/types/profile.types";

async function getSupabaseServerClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}

export async function getUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return {
      id: profile.id,
      name: profile.name,
      email: session.user.email || "",
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

export async function updateUserProfile(
  data: UpdateProfileInput
): Promise<ProfileResult> {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
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

    if (data.avatar_url !== undefined) {
      updates.avatar_url = data.avatar_url || null;
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Erro ao atualizar perfil." };
    }

    return {
      success: true,
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: session.user.email || "",
        avatar_url: updatedProfile.avatar_url,
        bio: updatedProfile.bio,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at,
      },
    };
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    return { success: false, error: "Erro interno ao atualizar perfil." };
  }
}
