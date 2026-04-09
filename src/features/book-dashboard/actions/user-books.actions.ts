"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import {
  UserBook,
  UserBookStatus,
  ReadingStatus,
  CreateUserBookInput,
  UpdateUserBookInput,
} from "@/domain/entities/user-book.entity";
import { COVER_COLORS, generateRandomCoverColor } from "../utils/book-config";
import { cache } from "react";

type SupabaseUserBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  content: string | null;
  content_url: string | null;
  status: string;
  reading_status: string;
  reading_progress: number;
  category: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

function formatUserBook(book: SupabaseUserBook): UserBook {
  return {
    id: book.id,
    userId: book.user_id,
    title: book.title,
    author: book.author,
    coverUrl: book.cover_url || undefined,
    coverColor: book.cover_color || "#8B4513",
    content: book.content || undefined,
    contentUrl: book.content_url || undefined,
    status: book.status as UserBookStatus,
    readingStatus: book.reading_status as ReadingStatus,
    readingProgress: book.reading_progress,
    category: book.category as UserBook["category"],
    wordCount: book.word_count,
    createdAt: new Date(book.created_at),
    updatedAt: new Date(book.updated_at),
    publishedAt: book.published_at ? new Date(book.published_at) : undefined,
  };
}

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

    const { data, error } = await supabase
      .from("user_books")
      .insert({
        user_id: currentUserId,
        title: input.title,
        author: input.author,
        cover_url: input.coverUrl,
        cover_color: input.coverColor || generateRandomCoverColor(),
        category: input.category,
        status: "draft",
        reading_status: "none",
        reading_progress: 0,
        word_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating book:", error);
      return { success: false, error: "Erro ao criar livro" };
    }

    revalidatePath("/dashboard/library");

    return { success: true, book: formatUserBook(data) };
  } catch (err) {
    console.error("Error in createUserBook:", err);
    return { success: false, error: "Erro interno" };
  }
}

export const getUserBooks = cache(
  async (userId: string, status?: UserBookStatus): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    let query = supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user books:", error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getUserReadingBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId)
      .eq("reading_status", "reading")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching reading books:", error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getUserCompletedBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId)
      .eq("reading_status", "completed")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching completed books:", error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getPublishedBooks = cache(
  async (): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching published books:", error);
      return [];
    }

    return (data || []).map(formatUserBook);
  }
);

export const getBookById = cache(
  async (id: string): Promise<UserBook | null> => {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching book:", error);
      return null;
    }

    return formatUserBook(data);
  }
);

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

export async function saveBookContent(
  id: string,
  content: string,
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

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const { error } = await supabase
      .from("user_books")
      .update({
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao salvar conteúdo" };
    }

    revalidatePath(`/book/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function publishBook(
  id: string,
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

    const { error } = await supabase
      .from("user_books")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao publicar livro" };
    }

    const { data: book } = await supabase
      .from("user_books")
      .select("*")
      .eq("id", id)
      .eq("user_id", currentUserId)
      .single();

    revalidatePath("/dashboard/library");
    revalidatePath(`/book/${id}`);
    return { success: true, book: book ? formatUserBook(book) : undefined };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function markAsReading(
  bookId: string,
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
      .update({
        reading_status: "reading",
        reading_progress: 0,
      })
      .eq("id", bookId)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao marcar como lendo" };
    }

    revalidatePath("/dashboard/library");
    return { success: true };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function markAsCompleted(
  bookId: string,
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
      .update({
        reading_status: "completed",
        reading_progress: 100,
      })
      .eq("id", bookId)
      .eq("user_id", currentUserId);

    if (error) {
      return { success: false, error: "Erro ao marcar como concluído" };
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

export async function getCurrentUserBooks(userId?: string): Promise<{
  myStories: UserBook[];
  reading: UserBook[];
  completed: UserBook[];
}> {
  let currentUserId = userId;
  
  if (!currentUserId) {
    currentUserId = await getCurrentUserIdOptional();
  }

  if (!currentUserId) {
    return { myStories: [], reading: [], completed: [] };
  }

  const [myStories, reading, completed] = await Promise.all([
    getUserBooks(currentUserId, "draft"),
    getUserReadingBooks(currentUserId),
    getUserCompletedBooks(currentUserId),
  ]);

  return { myStories, reading, completed };
}
