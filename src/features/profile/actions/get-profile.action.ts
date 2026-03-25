"use server";

import { Profile } from "@/features/profile/types/profile.types";

export async function getProfileAction(): Promise<Profile | null> {
  const { getUserProfile } = await import("./profile.actions");
  return getUserProfile();
}
