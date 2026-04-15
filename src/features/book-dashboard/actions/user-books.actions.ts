"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import {
  UserBook,
  UserBookStatus,
  CreateUserBookInput,
  UpdateUserBookInput,
} from "@/server/domain/entities/user-book.entity";
import { Book } from "@/server/domain/entities/book.entity";
import { SupabaseUserBookRepository } from "@/server/infrastructure/database";
import { generateRandomCoverColor } from "@/features/book-dashboard/config/book-config";
import { cache } from "react";

const userBookRepository = new SupabaseUserBookRepository();

export async function createUserBook(
  input: CreateUserBookInput,
  userId?: string
): Promise<{ success: boolean; book?: UserBook; error?: string }> {
  try {
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const book = await userBookRepository.create(currentUserId, {
      title: input.title,
      author: input.author,
      coverColor: input.coverColor || generateRandomCoverColor(),
      category: input.category,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/library");

    return { success: true, book };
  } catch (err) {
    console.error("Error in createUserBook:", err);
    return { success: false, error: "Erro interno" };
  }
}

export const getUserBooks = cache(
  async (userId: string, status?: UserBookStatus): Promise<UserBook[]> => {
    if (status) {
      return userBookRepository.getByUserIdAndStatus(userId, status);
    }
    return userBookRepository.getByUserId(userId, "my-stories");
  }
);

export const getUserReadingBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    return userBookRepository.getReadingBooks(userId);
  }
);

export const getUserCompletedBooks = cache(
  async (userId: string): Promise<UserBook[]> => {
    return userBookRepository.getCompletedBooks(userId);
  }
);

export const getPublishedBooks = cache(
  async (): Promise<UserBook[]> => {
    return userBookRepository.getPublishedBooks();
  }
);

export const getBookById = cache(
  async (id: string): Promise<UserBook | null> => {
    return userBookRepository.getById(id);
  }
);

export async function updateUserBook(
  id: string,
  input: UpdateUserBookInput,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    const updated = await userBookRepository.update(id, updateData);

    if (!updated) {
      return { success: false, error: "Erro ao atualizar livro" };
    }

    revalidatePath("/dashboard");
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
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await userBookRepository.saveContent(id, content, currentUserId);

    if (!success) {
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
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const book = await userBookRepository.publish(id, currentUserId);

    if (!book) {
      return { success: false, error: "Erro ao publicar livro" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/library");
    revalidatePath(`/book/${id}`);

    return { success: true, book };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}

export async function markAsReading(
  bookId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await userBookRepository.setReadingStatus(bookId, "reading", currentUserId);

    if (!success) {
      return { success: false, error: "Erro ao marcar como lendo" };
    }

    revalidatePath("/dashboard");
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
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await userBookRepository.setReadingStatus(bookId, "completed", currentUserId);

    if (!success) {
      return { success: false, error: "Erro ao marcar como concluído" };
    }

    revalidatePath("/dashboard");
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
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await userBookRepository.setReadingProgress(bookId, progress, currentUserId);

    if (!success) {
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
    let currentUserId = userId;
    
    if (!currentUserId) {
      currentUserId = await getCurrentUserIdOptional();
    }

    if (!currentUserId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const success = await userBookRepository.delete(id, currentUserId);

    if (!success) {
      return { success: false, error: "Erro ao excluir livro" };
    }

    revalidatePath("/dashboard");
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

function mapUserBookToBook(userBook: UserBook): Book {
  return {
    id: userBook.id,
    title: userBook.title,
    author: userBook.author,
    coverUrl: userBook.coverUrl,
    coverColor: userBook.coverColor,
    description: "",
    category: userBook.category,
    pages: Math.ceil((userBook.wordCount || 0) / 500),
    rating: 0,
    ratingCount: 0,
    reviewCount: 0,
    createdAt: userBook.createdAt,
  };
}

export async function getDashboardBooks(): Promise<Book[]> {
  const userId = await getCurrentUserIdOptional();

  const publishedBooks = await getPublishedBooks();
  const publishedAsBooks = publishedBooks.map(mapUserBookToBook);

  if (!userId) {
    return publishedAsBooks;
  }

  const { myStories, reading, completed } = await getCurrentUserBooks(userId);
  const userBooksAsBooks = [...myStories, ...reading, ...completed].map(mapUserBookToBook);

  return [...userBooksAsBooks, ...publishedAsBooks];
}
