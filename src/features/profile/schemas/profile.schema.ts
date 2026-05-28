import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
