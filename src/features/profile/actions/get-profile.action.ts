"use server";

import { User } from "@/domain/entities/user.entity";

export async function getProfileAction(): Promise<User | null> {
  const { getUserProfile } = await import("./profile.actions");
  return getUserProfile();
}
