# Server Actions Specification

## Description
Este documento define a especificação para Server Actions na aplicação Conta.AI. Server Actions são funções executadas no servidor que podem ser chamadas diretamente por componentes cliente.

## Baseado em
- Next.js App Router Patterns
- Projeto: `src/features/*/actions/`

---

## 1. Padrão de Server Action

### Estrutura de Arquivo

```
src/features/book-dashboard/actions/
├── books.actions.ts           # Server Actions em arquivo .actions.ts
├── user-books.actions.ts
├── user-favorites.actions.ts
└── index.ts                   # Barrel exports
```

### Template

```tsx
"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/utils/supabase/server";

type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

export async function getDataAction(
  id: string
): Promise<ActionResult<Data>> {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("table")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: "Mensagem de erro" };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error in getDataAction:", err);
    return { success: false, error: "Erro interno" };
  }
}

export async function mutateDataAction(
  input: InputType
): Promise<ActionResult> {
  try {
    // Validação
    if (!input.name) {
      return { success: false, error: "Nome é obrigatório" };
    }

    const supabase = await getSupabaseServerClient();
    
    const { error } = await supabase
      .from("table")
      .insert(input);

    if (error) {
      return { success: false, error: "Erro ao salvar" };
    }

    // Revalidar cache
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (err) {
    console.error("Error in mutateDataAction:", err);
    return { success: false, error: "Erro interno" };
  }
}
```

---

## 2. Server Actions Existentes

### 2.1 Books Actions

```tsx
// src/features/book-dashboard/actions/books.actions.ts

// Query: Buscar todos os livros
export async function getBooksAction(): Promise<Book[]>

// Query: Buscar livro por ID
export async function getBookByIdAction(id: string): Promise<Book | null>

// Query: Buscar livros por categoria
export async function getBooksByCategoryAction(category: string): Promise<Book[]>

// Query: Buscar livros por termo
export async function searchBooksAction(query: string): Promise<Book[]>

// Cache: Revalidar cache
export async function revalidateBooksCache(path?: string): Promise<void>
export async function invalidateBooks(): Promise<void>
```

### 2.2 User Books Actions

```tsx
// src/features/book-dashboard/actions/user-books.actions.ts

// Mutation: Criar livro
export async function createUserBook(
  input: CreateUserBookInput,
  userId?: string
): Promise<{ success: boolean; book?: UserBook; error?: string }>

// Query: Buscar livros do usuário
export const getUserBooks = cache(
  async (userId: string, status?: UserBookStatus): Promise<UserBook[]>
)

// Query: Buscar livros lendo
export const getUserReadingBooks = cache(
  async (userId: string): Promise<UserBook[]>
)

// Query: Buscar livros concluídos
export const getUserCompletedBooks = cache(
  async (userId: string): Promise<UserBook[]>
)

// Query: Buscar livros publicados
export const getPublishedBooks = cache(
  async (): Promise<UserBook[]>
)

// Query: Buscar livro por ID
export const getBookById = cache(
  async (id: string): Promise<UserBook | null>
)

// Mutation: Atualizar livro
export async function updateUserBook(
  id: string,
  input: UpdateUserBookInput,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Salvar conteúdo
export async function saveBookContent(
  id: string,
  content: string,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Publicar livro
export async function publishBook(
  id: string,
  userId?: string
): Promise<{ success: boolean; book?: UserBook; error?: string }>

// Mutation: Marcar como lendo
export async function markAsReading(
  bookId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Marcar como concluído
export async function markAsCompleted(
  bookId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Atualizar progresso
export async function updateReadingProgress(
  bookId: string,
  progress: number,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Deletar livro
export async function deleteUserBook(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }>

// Query: Buscar todos os livros do usuário
export async function getCurrentUserBooks(userId?: string): Promise<{
  myStories: UserBook[];
  reading: UserBook[];
  completed: UserBook[];
}>
```

### 2.3 User Favorites Actions

```tsx
// src/features/book-dashboard/actions/user-favorites.actions.ts

// Mutation: Adicionar aos favoritos
export async function addToFavorites(
  bookId: string,
  bookTitle: string,
  bookAuthor: string,
  bookCoverColor?: string,
  bookCoverUrl?: string,
  bookCategory?: string
): Promise<{ success: boolean; error?: string }>

// Mutation: Remover dos favoritos
export async function removeFromFavorites(
  bookId: string
): Promise<{ success: boolean; error?: string }>

// Query: Buscar favoritos do usuário
export async function getUserFavorites(): Promise<UserFavorite[]>

// Query: Verificar se livro está favoritado
export async function isBookFavorited(bookId: string): Promise<boolean>
```

### 2.4 Auth Actions

```tsx
// src/features/auth/actions/auth.actions.ts

// Auth: Login
export async function signInWithEmail(
  email: string,
  password: string
): Promise<SignInResult>

// Auth: Registro
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<SignUpResult>

// Auth: Logout
export async function signOutAction(): Promise<SignOutResult>

// Auth: Verificar autenticação
export async function verifyAuthAction(): Promise<{ authenticated: boolean }>
```

### 2.5 Profile Actions

```tsx
// src/features/profile/actions/

// Query: Buscar perfil
export async function getProfileAction(): Promise<Profile | null>
export async function getUserProfile(): Promise<Profile | null>

// Mutation: Atualizar perfil
export async function updateUserProfile(
  data: UpdateProfileInput
): Promise<ProfileResult>
export async function updateProfileAction(
  params: UpdateProfileParams
): Promise<ProfileResult>

// Mutation: Upload de avatar
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }>
```

---

## 3. Padrões de Server Action

### 3.1 Cliente Supabase

```tsx
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
```

### 3.2 Padrão de Retorno

```tsx
// ✅ Sempre retornar estrutura consistente
type Result<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

// Query - pode retornar dados diretamente
export async function getBooks(): Promise<Book[]> {
  // erro tratado internamente, retorna array vazia
}

// Mutation - retornar resultado estruturado
export async function createBook(input: CreateInput): Promise<Result> {
  const { data, error } = await supabase...
  
  if (error) {
    return { success: false, error: "Mensagem amigável" };
  }
  
  return { success: true, data };
}
```

### 3.3 Cache com React.cache

```tsx
import { cache } from "react";

export const getUserBooks = cache(
  async (userId: string, status?: string): Promise<UserBook[]> => {
    const supabase = await getSupabaseServerClient();
    
    let query = supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data } = await query;
    return data || [];
  }
);
```

### 3.4 Revalidação

```tsx
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidar caminho específico
revalidatePath("/dashboard");
revalidatePath("/dashboard/library");

// Revalidar tag (se implementado)
revalidateTag("books");
```

---

## 4. Boas Práticas

### 4.1 Diretiva "use server"

```tsx
// Primeira linha do arquivo
"use server";

// ou para funções individuais
async function handler() {
  "use server";
  // lógica...
}
```

### 4.2 Tratamento de Erros

```tsx
// ✅ Try-catch com logging
try {
  // lógica...
} catch (err) {
  console.error("Error in actionName:", err);
  return { success: false, error: "Erro interno" };
}

// ✅ Retornar mensagens amigáveis
if (error.code === "23505") {
  return { success: false, error: "Item duplicado" };
}
```

### 4.3 Validação de Input

```tsx
// ✅ Validar inputs
export async function createBook(input: CreateInput): Promise<Result> {
  if (!input.title || input.title.length > 200) {
    return { success: false, error: "Título inválido" };
  }
  
  if (!input.author) {
    return { success: false, error: "Autor é obrigatório" };
  }
  
  // continuar...
}
```

### 4.4 Autenticação

```tsx
// ✅ Verificar usuário
async function getCurrentUserId(): Promise<string | undefined> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function protectedAction(): Promise<Result> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }
  
  // continuar...
}
```

### 4.5 Tipagem

```tsx
// ✅ Tipar retornos explicitamente
export async function getBooks(): Promise<Book[]> { }

// ✅ Tipar resultados de mutation
export type CreateBookResult = 
  | { success: true; book: Book }
  | { success: false; error: string };

export async function createBook(
  input: CreateBookInput
): Promise<CreateBookResult> { }
```

---

## 5. Chamando Server Actions

### 5.1 De Componentes Cliente

```tsx
"use client";

import { createBookAction } from "@/features/book-dashboard/actions/user-books.actions";

export function CreateBookWidget() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const result = await createBookAction({ title: "My Book", author: "Me" });
    setLoading(false);
    
    if (!result.success) {
      alert(result.error);
    }
  }

  return <button onClick={handleSubmit} disabled={loading}>Create</button>;
}
```

### 5.2 De Form Actions

```tsx
// form action
export async function createBookAction(formData: FormData) {
  "use server";
  
  const title = formData.get("title") as string;
  // validar e criar...
}
```

---

## Acceptance Criteria

- [ ] Server Actions usam diretiva `"use server"`
- [ ] Arquivos com extensão `.actions.ts`
- [ ] Cliente Supabase configurado corretamente
- [ ] Tratamento de erros com try-catch
- [ ] Retornos estruturados ({ success, data/error })
- [ ] Revalidação de cache quando necessário
- [ ] Queries com `cache` do React para deduplicação
- [ ] Validação de inputs antes de operações
- [ ] Verificação de autenticação quando necessário
