# Page Routing Specification

## Description
Este documento define a especificação para estrutura de páginas e rotas na aplicação Conta.AI usando Next.js App Router.

## Baseado em
- Next.js App Router Patterns
- Projeto: `src/app/`

---

## 1. Estrutura de Rotas

### 1.1 Arquitetura de Arquivos

```
src/app/
├── page.tsx                           # Landing page (/)
├── layout.tsx                         # Root layout
├── loading.tsx                        # Loading global
├── error.tsx                         # Error global
├── not-found.tsx                     # 404 global
│
├── login/
│   ├── page.tsx                      # /login
│   └── layout.tsx                    # Layout específico
│
├── register/
│   ├── page.tsx                      # /register
│   └── layout.tsx
│
├── dashboard/                         # Área autenticada
│   ├── page.tsx                      # /dashboard
│   ├── layout.tsx                    # Layout com sidebar
│   ├── loading.tsx
│   ├── error.tsx
│   │
│   ├── library/
│   │   └── page.tsx                  # /dashboard/library
│   │
│   ├── favorites/
│   │   └── page.tsx                  # /dashboard/favorites
│   │
│   ├── downloads/
│   │   └── page.tsx                  # /dashboard/downloads
│   │
│   ├── category/
│   │   └── page.tsx                  # /dashboard/category
│   │
│   ├── settings/
│   │   └── page.tsx                  # /dashboard/settings
│   │
│   ├── audio/
│   │   └── page.tsx                  # /dashboard/audio
│   │
│   └── editor/
│       └── [id]/
│           └── page.tsx              # /dashboard/editor/[id]
│
├── book/
│   └── [id]/
│       └── page.tsx                  # /book/[id]
│
├── library/
│   └── page.tsx                      # /library (público)
│
├── category/
│   └── page.tsx                      # /category (público)
│
├── favorites/
│   └── page.tsx                      # /favorites (público)
│
├── downloads/
│   └── page.tsx                      # /downloads (público)
│
├── audio-books/
│   └── page.tsx                      # /audio-books
│
└── landingpage/
    └── page.tsx                      # /landingpage
```

---

## 2. Tipos de Página

### 2.1 Server Page (Padrão)

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user.name}</p>
    </div>
  );
}
```

### 2.2 Client Page

```tsx
// app/dashboard/library/page.tsx
"use client";

import { LibraryContentWidget } from "@/features/book-dashboard/widgets/library-content.widget";

export default function LibraryPage() {
  return <LibraryContentWidget />;
}
```

### 2.3 Async Server Page

```tsx
// app/book/[id]/page.tsx
import { getBookByIdAction } from "@/features/book-dashboard/actions/books.actions";
import { BookDetailsWidget } from "@/features/book-dashboard/widgets/book-details.widget";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookByIdAction(id);

  if (!book) {
    notFound();
  }

  return <BookDetailsWidget book={book} />;
}
```

---

## 3. Layouts

### 3.1 Root Layout

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";
import { Providers } from "@/shared/config/providers";
import { Header } from "@/shared/ui/header";
import { Toaster } from "@/shared/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Conta.AI",
    template: "%s | Conta.AI",
  },
  description: "Sua biblioteca digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

### 3.2 Dashboard Layout

```tsx
// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getUserProfile } from "@/features/profile/actions/profile.actions";
import { DashboardShellWidget } from "@/shared/widgets/dashboard-shell.widget";
import { Sidebar } from "@/shared/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  
  if (!profile) {
    redirect("/login");
  }

  return (
    <DashboardShellWidget>
      <Sidebar />
      <main>{children}</main>
    </DashboardShellWidget>
  );
}
```

---

## 4. Route Groups

### 4.1 Autenticação

```tsx
// app/(auth)/login/page.tsx
// app/(auth)/register/page.tsx

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      {children}
    </div>
  );
}
```

### 4.2 API Routes

```tsx
// app/api/auth/[...nextauth]/route.ts
// Handler para NextAuth

// app/api/books/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // GET /api/books
}

export async function POST(request: Request) {
  // POST /api/books
}
```

---

## 5. Padrões de Página

### 5.1 Página com Fetching

```tsx
// app/dashboard/library/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { getCurrentUserBooks } from "@/features/book-dashboard/actions/user-books.actions";
import { LibraryContentWidget } from "@/features/book-dashboard/widgets/library-content.widget";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const { myStories, reading, completed } = await getCurrentUserBooks(user.id);

  return (
    <LibraryContentWidget
      initialData={{ myStories, reading, completed }}
    />
  );
}
```

### 5.2 Página com Params

```tsx
// app/book/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function BookPage({ 
  params,
  searchParams 
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  
  const book = await getBookByIdAction(id);
  
  return <BookDetailsWidget book={book} activeTab={tab} />;
}
```

### 5.3 Página Estática

```tsx
// app/about/page.tsx
export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div>
      <h1>Sobre</h1>
      <p>Conteúdo estático</p>
    </div>
  );
}
```

---

## 6. Loading & Error

### 6.1 Loading

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
```

### 6.2 Error

```tsx
// app/dashboard/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Algo deu errado!</h2>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
```

---

## 7. Navegação

### 7.1 Link

```tsx
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
<Link href={`/book/${book.id}`}>{book.title}</Link>
<Link href="/dashboard" replace> {/* Sem history */}

```

### 7.2 useRouter (Client)

```tsx
"use client";

import { useRouter } from "next/navigation";

function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/dashboard");
    // ou
    router.replace("/dashboard");
    // ou
    router.back();
    // ou
    router.refresh(); // Revalida server components
  };
}
```

### 7.3 redirect (Server)

```tsx
import { redirect } from "next/navigation";

async function getData() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
}
```

---

## 8. Boas Práticas

### 8.1 Nomeação

```tsx
// ✅ Arquivos de rota
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx

// ✅ Dynamic routes
[slug]/page.tsx
[id]/page.tsx
[...catchall]/page.tsx

// ❌ Evitar
index.tsx // usar page.tsx
```

### 8.2 Async Params

```tsx
// Next.js 15+ - params é Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

### 8.3 Server/Client Separation

```tsx
// Server: apenas data fetching
// app/page.tsx
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client: interatividade
// app/components/client-component.tsx
"use client";
export function ClientComponent({ data }) {
  const [state, setState] = useState(data);
  // ...
}
```

---

## Acceptance Criteria

- [ ] Arquivos de rota seguem convenção page.tsx
- [ ] Layouts definidos em layout.tsx
- [ ] Loading UI em loading.tsx
- [ ] Error boundary em error.tsx
- [ ] 404 em not-found.tsx
- [ ] Params tratados como Promise (Next.js 15+)
- [ ] Redirect em Server Components
- [ ] useRouter em Client Components
- [ ] Link para navegação entre páginas
- [ ] Route groups com (folder)
