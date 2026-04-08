import { User } from "@/domain/entities/user.entity";

export type ProfileRow = {
  id: string;
  name: string | null;
  email?: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export function mapToUserEntity(profile: ProfileRow, email: string): User {
  return {
    id: profile.id,
    email,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}