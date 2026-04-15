# Next.js Best Practices Specification

## Description
Este documento define as melhores práticas para desenvolvimento com Next.js App Router na aplicação Conta.AI.

## Baseado em
- Next.js App Router Patterns Skill (`.agents/skills/wshobson-agents/plugins/frontend-mobile-development/skills/nextjs-app-router-patterns/`)

---

## 1. Server Components

### 1.1 Padrão Default

```tsx
// app/page.tsx - Server Component por padrão
import { getBooksAction } from "@/features/book-dashboard/actions/books.actions";

export default async function HomePage() {
  const books = await getBooksAction();

  return (
    <div>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

### 1.2 Quando Usar Server Component

| Cenário | Componente |
|---------|-----------|
| Data fetching | ✅ Server |
| Acesso a banco | ✅ Server |
| Accesso a secrets | ✅ Server |
| Interatividade | ❌ Client |
| useState, useEffect | ❌ Client |
| Browser APIs | ❌ Client |

### 1.3 Diretiva "use client"

```tsx
// src/shared/widgets/book-card.widget.tsx
"use client";

import { useState } from "react";

export function BookCardWidget() {
  const [loading, setLoading] = useState(false);
  // lógica de cliente...
  return <div>...</div>;
}
```

---

## 2. Data Fetching

### 2.1 Fetching em Server Components

```tsx
// app/dashboard/page.tsx
import { getBooksAction } from "@/features/book-dashboard/actions/books.actions";

export default async function DashboardPage() {
  // Fetch direto - executa no servidor
  const books = await getBooksAction();
  
  return <BookList books={books} />;
}
```

### 2.2 Fetching Paralelo

```tsx
// ✅ Buscar dados em paralelo para evitar waterfalls
async function getDashboardData() {
  const [user, books, notifications] = await Promise.all([
    getCurrentUser(),
    getBooks(),
    getNotifications(),
  ]);
  
  return { user, books, notifications };
}

export default async function Page() {
  const { user, books, notifications } = await getDashboardData();
  // render...
}
```

### 2.3 Fetching Sequencial (se necessário)

```tsx
// Apenas se a segunda query depender da primeira
async function getData() {
  const user = await getCurrentUser();
  const preferences = await getUserPreferences(user.id);
  return { user, preferences };
}
```

### 2.4 Streaming

```tsx
// app/page.tsx
import { Suspense } from "react";
import { BookList } from "./book-list";
import { BookListSkeleton } from "./book-list-skeleton";

export default function Page() {
  return (
    <div>
      <h1>Books</h1>
      <Suspense fallback={<BookListSkeleton />}>
        <BookList />
      </Suspense>
    </div>
  );
}

// app/book-list.tsx - slow component
export async function BookList() {
  const books = await slowGetBooks(); // pode demorar
  return <div>{books.map(...)}</div>;
}
```

---

## 3. Caching

### 3.1 Fetch Caching

```tsx
// Cache padrão - mesma URL com mesmos params = cacheado
fetch("https://api.example.com/books", {
  next: { revalidate: 3600 }, // revalida a cada hora
});

// Não cacheado
fetch("https://api.example.com/books", {
  cache: "no-store",
});
```

### 3.2 React.cache

```tsx
import { cache } from "react";

// Cache a nível de função - deduplica requests
export const getBookById = cache(
  async (id: string): Promise<Book | null> => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();
    return data;
  }
);

// Mesmo ID em múltiplos componentes = apenas 1 request
function BookPage({ id }: { id: string }) {
  const book1 = await getBookById(id); // First request
  const book2 = await getBookById(id); // Cached!
}
```

### 3.3 Revalidação

```tsx
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidar caminho
revalidatePath("/dashboard");
revalidatePath("/dashboard/[category]");

// Revalidar tag
revalidateTag("books");

// Em Server Action
export async function createBook(data: CreateBookInput) {
  // ...criar livro...
  revalidatePath("/dashboard");
}
```

---

## 4. Server Actions

### 4.1 Definição

```tsx
// src/features/books/actions/create-book.action.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createBook(formData: FormData) {
  const title = formData.get("title");
  
  // Validação
  if (!title) {
    return { error: "Title is required" };
  }
  
  // Banco de dados
  await db.books.create({ title });
  
  // Revalidar
  revalidatePath("/dashboard");
  
  return { success: true };
}
```

### 4.2 Uso em Form

```tsx
// app/page.tsx
import { createBook } from "@/features/books/actions/create-book.action";

export default function Page() {
  return (
    <form action={createBook}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 4.3 Uso com useFormStatus

```tsx
// src/shared/ui/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </button>
  );
}
```

---

## 5. Rotas

### 5.1 Estrutura de Arquivos

```
app/
├── page.tsx                    # /
├── layout.tsx                  # Root layout
├── loading.tsx                 # Loading UI
├── error.tsx                   # Error boundary
├── not-found.tsx              # 404
├── dashboard/
│   ├── page.tsx               # /dashboard
│   ├── layout.tsx             # Dashboard layout
│   ├── loading.tsx
│   ├── error.tsx
│   └── [id]/
│       ├── page.tsx           # /dashboard/[id]
│       └── edit/
│           └── page.tsx       # /dashboard/[id]/edit
├── books/
│   ├── page.tsx               # /books
│   └── [id]/
│       └── page.tsx           # /books/[id]
└── api/
    └── books/
        └── route.ts           # API endpoint
```

### 5.2 Route Handlers

```tsx
// app/api/books/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const books = await getBooks();
  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const body = await request.json();
  const book = await createBook(body);
  return NextResponse.json(book, { status: 201 });
}
```

---

## 6. Layouts

### 6.1 Root Layout

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Conta.AI",
    template: "%s | Conta.AI",
  },
  description: "Book management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 6.2 Layout de Rota

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

### 6.3 Template

```tsx
// app/dashboard/template.tsx
// Templates são como layouts mas remount em navegação
"use client";

import { useEffect, useState } from "react";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <div>{children}</div>;
}
```

---

## 7. Otimização

### 7.1 Dynamic Imports

```tsx
import dynamic from "next/dynamic";

// Componente pesado - carrega apenas no cliente
const BookEditor = dynamic(
  () => import("@/features/editor/widgets/book-editor.widget"),
  { 
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);

// Componente opcional
const HeavyChart = dynamic(
  () => import("./heavy-chart"),
  { ssr: false }
);
```

### 7.2 Imagens

```tsx
import Image from "next/image";

export function BookCover({ url, title }: { url?: string; title: string }) {
  return (
    <Image
      src={url || "/placeholder.png"}
      alt={title}
      width={200}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/..."
    />
  );
}
```

### 7.3 Fontes

```tsx
// app/layout.tsx
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair" 
});

export default function Layout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 8. Boas Práticas

### 8.1 Server Components por Padrão

```tsx
// ✅ Server Component
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// ❌ Client Component desnecessário
"use client";
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { fetchData().then(setData) }, []);
  return <Component data={data} />;
}
```

### 8.2 Mínima Superfície Client

```tsx
// ✅ Separar lógica de UI
// page.tsx - Server
import { BookList } from "./book-list";

export default async function Page() {
  const books = await getBooks();
  return <BookList books={books} />;
}

// book-list.tsx - Client apenas para interatividade
"use client";
import { BookCard } from "./book-card";

export function BookList({ books }) {
  const [selected, setSelected] = useState(null);
  return books.map(book => 
    <BookCard key={book.id} book={book} onClick={setSelected} />
  );
}
```

### 8.3 Tipos em Server/Client Boundary

```tsx
// types/book.ts - compartilhado
export type Book = {
  id: string;
  title: string;
};

// server/ actions - retorna tipo compartilhado
export async function getBooks(): Promise<Book[]> { }

// client/ component - recebe tipo compartilhado
export function BookList({ books }: { books: Book[] }) { }
```

---

## Acceptance Criteria

- [ ] Server Components por padrão
- [ ] "use client" apenas quando necessário
- [ ] Fetching paralelo com Promise.all
- [ ] React.cache para deduplicação
- [ ] Loading UI com Suspense
- [ ] Revalidação após mutations
- [ ] Dynamic imports para componentes pesados
- [ ] Metadata para SEO
- [ ] Fontes otimizadas com next/font
- [ ] Imagens com next/image
