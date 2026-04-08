import { IUserRepository } from "@/domain/repositories/user.repository";
import { User, UpdateUserInput } from "@/domain/entities/user.entity";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { mapToUserEntity } from "../mappers/user.mapper";

export class SupabaseUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const supabase = await getSupabaseServerClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (!profile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || "";

    return mapToUserEntity(profile, email);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const supabase = await getSupabaseServerClient();

    const updates: Record<string, string | null> = {};
    if (data.name !== undefined) updates.name = data.name || null;
    if (data.bio !== undefined) updates.bio = data.bio || null;
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl || null;
    updates.updated_at = new Date().toISOString();

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .upsert({ id, ...updates })
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update user");
    }

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || "";

    return mapToUserEntity(updatedProfile, email);
  }

  async getByEmail(email: string): Promise<User | null> {
    return null;
  }
}