"use server";

import { UploadResult } from "@/features/profile/types/profile.types";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Arquivo muito grande. O tamanho máximo é 2MB.",
      };
    }

    const supabase = await getSupabaseServerClient();
    const extension = getFileExtension(file.type);
    const fileName = `avatar.${extension}`;
    const filePath = `${userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("contaai")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Erro ao fazer upload da imagem.",
      };
    }

    const { data: urlData } = supabase.storage
      .from("contaai")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (err) {
    console.error("Error in uploadAvatar:", err);
    return {
      success: false,
      error: "Erro interno ao fazer upload.",
    };
  }
}

export async function deleteAvatar(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    const extensions = ["jpg", "png", "webp"];

    for (const ext of extensions) {
      const filePath = `${userId}/avatar.${ext}`;
      await supabase.storage.from("contaai").remove([filePath]);
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteAvatar:", err);
    return { success: false, error: "Erro ao deletar avatar." };
  }
}
