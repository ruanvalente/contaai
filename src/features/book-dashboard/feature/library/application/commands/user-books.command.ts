"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { UserBook, UpdateUserBookInput, ReadingStatus } from "@/domain/entities/user-book.entity";

type CreateUserBookInput = {
  title: string;
  author: string;
  category: string;
  coverUrl?: string;
  coverColor?: string;
};

export async function createUserBook(
  input: CreateUserBookInput,
  userId?: string
): Promise<{ success: boolean; book?: UserBook; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const bookData = {
      user_id: currentUserId,
      title: input.title,
      author: input.author,
      cover_color: input.coverColor || "#8B4513",
      category: input.category || "ficção",
      status: "draft",
      reading_status: "none",
      reading_progress: 0,
      word_count: 0,
    };

    const { data, error } = await supabase
      .from("user_books")
      .insert(bookData)
      .select()
      .single();

    if (error) {
      console.error("Error creating book:", error);
      return { success: false, error: "Erro ao criar livro" };
    }

    return {
      success: true,
      book: {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        author: data.author,
        coverUrl: data.cover_url || undefined,
        coverColor: data.cover_color || "#8B4513",
        content: data.content || undefined,
        contentUrl: data.content_url || undefined,
        status: data.status as UserBook["status"],
        readingStatus: data.reading_status as UserBook["readingStatus"],
        readingProgress: data.reading_progress,
        category: data.category as UserBook["category"],
        wordCount: data.word_count,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
    };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function deleteUserBook(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const { error } = await supabase
      .from("user_books")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao excluir livro" };
    }

    revalidatePath("/dashboard/library");
    return { success: true };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function updateUserBook(
  id: string,
  input: UpdateUserBookInput,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const updateData: Record<string, unknown> = { ...input };

    Object.keys(updateData).forEach(
      (key) =>
        updateData[key] === undefined && delete updateData[key]
    );

    const { error } = await supabase
      .from("user_books")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao atualizar livro" };
    }

    revalidatePath("/dashboard/library");
    return { success: true };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function updateReadingProgress(
  bookId: string,
  progress: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    let readingStatus: ReadingStatus = "reading";
    if (progress >= 100) {
      readingStatus = "completed";
    } else if (progress <= 0) {
      readingStatus = "none";
    }

    const { error } = await supabase
      .from("user_books")
      .update({
        reading_progress: Math.min(100, Math.max(0, progress)),
        reading_status: readingStatus,
      })
      .eq("id", bookId)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao atualizar progresso" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}
