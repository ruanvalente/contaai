'use server';

import { getCurrentUserIdOptional } from "@/utils/auth/get-current-user.server";
import { cache } from "react";

export type Author = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
  age?: number;
  createdAt: Date;
};

export type AuthorBook = {
  id: string;
  title: string;
  coverColor?: string;
  coverUrl?: string;
};

export type AuthorWithBooks = Author & {
  books: AuthorBook[];
};

export type AuthorFollowResult =
  | { success: boolean; error?: string }
  | { success: false; error: string };

const MOCK_AUTHORS: Author[] = [
  {
    id: "1",
    name: "Machado de Assis",
    email: "machado@autor.com",
    avatar: "https://api.dicebear.com/7.x/initials.svg?seed=MCA",
    description: "Um dos maiores escritores brasileiros de todos os tempos.",
    age: 69,
    createdAt: new Date("1899-12-29"),
  },
  {
    id: "2",
    name: "Clarice Lispector",
    email: "clarice@autor.com",
    avatar: "https://api.dicebear.com/7.x/initials.svg?seed=CLA",
    description: "Escritora brasileira reconhecida internacionalmente.",
    age: 57,
    createdAt: new Date("1977-12-09"),
  },
  {
    id: "3",
    name: "Jorge Amado",
    email: "jorge@autor.com",
    avatar: "https://api.dicebear.com/7.x/initials.svg?seed=JAM",
    description: "Autor de obras-primas da literatura brasileira.",
    age: 79,
    createdAt: new Date("2001-08-06"),
  },
];

const MOCK_BOOKS: Record<string, AuthorBook[]> = {
  "1": [
    { id: "b1", title: "Dom Casmurro", coverColor: "#2c5282" },
    { id: "b2", title: "Memórias Póstumas de Brás Cubas", coverColor: "#744210" },
    { id: "b3", title: "Quincas Borba", coverColor: "#38a169" },
  ],
  "2": [
    { id: "b4", title: "A Hora da Estrela", coverColor: "#d69e2e" },
    { id: "b5", title: "Laços de Família", coverColor: "#805ad5" },
  ],
  "3": [
    { id: "b6", title: "Gabriela, Cravo e Canela", coverColor: "#c53030" },
    { id: "b7", title: "Tereza Batista", coverColor: "#3182ce" },
  ],
};

export const getAuthors = cache(async (): Promise<AuthorWithBooks[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return MOCK_AUTHORS.map((author) => ({
    ...author,
    books: MOCK_BOOKS[author.id] || [],
  }));
});

export const getAuthorById = cache(async (authorId: string): Promise<AuthorWithBooks | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const author = MOCK_AUTHORS.find((a) => a.id === authorId);
  if (!author) return null;

  return {
    ...author,
    books: MOCK_BOOKS[author.id] || [],
  };
});

export const followAuthor = cache(async (authorId: string): Promise<AuthorFollowResult> => {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const followedAuthors = getFollowedAuthorsIds();
    if (followedAuthors.includes(authorId)) {
      return { success: false, error: "Você já segue este autor" };
    }

    followedAuthors.push(authorId);
    return { success: true };
  } catch (err) {
    console.error("Error in followAuthor:", err);
    return { success: false, error: "Erro interno" };
  }
});

export const unfollowAuthor = cache(async (authorId: string): Promise<AuthorFollowResult> => {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const followedAuthors = getFollowedAuthorsIds();
    const index = followedAuthors.indexOf(authorId);
    if (index === -1) {
      return { success: false, error: "Você não segue este autor" };
    }

    followedAuthors.splice(index, 1);
    return { success: true };
  } catch (err) {
    console.error("Error in unfollowAuthor:", err);
    return { success: false, error: "Erro interno" };
  }
});

const followedAuthorsCache = new Map<string, string[]>();

function getFollowedAuthorsIds(): string[] {
  return followedAuthorsCache.get("default") || [];
}

export const isAuthorFollowed = cache(async (authorId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) return false;

    return getFollowedAuthorsIds().includes(authorId);
  } catch {
    return false;
  }
});

export const getFollowedAuthors = cache(async (): Promise<AuthorWithBooks[]> => {
  try {
    const userId = await getCurrentUserIdOptional();
    if (!userId) return [];

    const followedIds = getFollowedAuthorsIds();
    return MOCK_AUTHORS
      .filter((a) => followedIds.includes(a.id))
      .map((author) => ({
        ...author,
        books: MOCK_BOOKS[author.id] || [],
      }));
  } catch {
    return [];
  }
});