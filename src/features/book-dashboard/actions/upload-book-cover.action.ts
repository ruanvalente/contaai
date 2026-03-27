"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadBookCover(
  file: File,
  bookId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Tipo não permitido. Use JPG, PNG ou WebP." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Arquivo muito grande. Máximo 2MB." };
    }

    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const ext = file.type.split("/")[1];
    const filePath = `covers/${user.id}/${bookId}/cover.${ext}`;

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
      return { success: false, error: "Erro ao fazer upload" };
    }

    const { data: urlData } = supabase.storage
      .from("contaai")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error("Error in uploadBookCover:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function deleteBookCover(
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const extensions = ["jpg", "png", "webp"];

    for (const ext of extensions) {
      const filePath = `covers/${user.id}/${bookId}/cover.${ext}`;
      await supabase.storage.from("contaai").remove([filePath]);
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteBookCover:", err);
    return { success: false, error: "Erro ao deletar capa" };
  }
}
