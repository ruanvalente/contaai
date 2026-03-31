# UI Component Specification

## Description
Este documento define a especificação para componentes de UI (User Interface) na aplicação Conta.AI. Componentes de UI são componentes visuais puros, sem lógica de negócio ou estado interno.

## Baseado em
- Web Component Design Skill (`.agents/skills/wshobson-agents/plugins/ui-design/skills/web-component-design/`)
- Projeto: `src/shared/ui/`

---

## 1. Padrão de Componente UI

### Estrutura de Arquivo

```
src/shared/ui/
├── button.ui.tsx           # Componente com extensão .ui.tsx
├── button.spec.tsx         # Testes (opcional)
├── button.types.ts         # Tipos (se necessário)
└── index.ts               # Barrel exports
```

### Template

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonUiProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const ButtonUi = forwardRef<HTMLButtonElement, ButtonUiProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          variant === "primary" && "bg-primary text-white hover:bg-primary/90",
          variant === "secondary" && "bg-secondary text-secondary-foreground",
          variant === "ghost" && "hover:bg-accent",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4",
          size === "lg" && "h-12 px-6 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonUi.displayName = "ButtonUi";
```

---

## 2. Componentes UI Existentes

### 2.1 Avatar

```tsx
// src/shared/ui/avatar.tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}
```

### 2.2 Badge

```tsx
// src/shared/ui/badge.tsx
interface BadgeProps {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error";
  children: React.ReactNode;
}
```

### 2.3 Book Card

```tsx
// src/shared/ui/book-card.tsx
interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverColor?: string;
  category?: string;
  rating?: number;
}
```

### 2.4 Book Cover

```tsx
// src/shared/ui/book-cover.tsx
interface BookCoverProps {
  coverUrl?: string;
  coverColor?: string;
  title: string;
  size?: "sm" | "md" | "lg";
}
```

### 2.5 Button

```tsx
// src/shared/ui/button.tsx
interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}
```

### 2.6 Category Header

```tsx
// src/shared/ui/category-header.ui.tsx
interface CategoryHeaderProps {
  title: string;
  description?: string;
}
```

### 2.7 Container

```tsx
// src/shared/ui/container.tsx
interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}
```

### 2.8 Empty Library State

```tsx
// src/shared/ui/empty-library-state.ui.tsx
interface EmptyLibraryStateProps {
  title?: string;
  description?: string;
}
```

### 2.9 Empty Favorites State

```tsx
// src/shared/ui/empty-favorites-state.ui.tsx
interface EmptyFavoritesStateProps {
  onAction?: () => void;
}
```

### 2.10 Header

```tsx
// src/shared/ui/header.ui.tsx
interface HeaderProps {
  title: string;
  subtitle?: string;
}
```

### 2.11 Library Header

```tsx
// src/shared/ui/library-header.ui.tsx
interface LibraryHeaderProps {
  title: string;
  className?: string;
}
```

### 2.12 Pagination

```tsx
// src/shared/ui/pagination.ui.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 2.13 Published Notification

```tsx
// src/shared/ui/published-notification.ui.tsx
interface PublishedNotificationProps {
  title: string;
  bookId: string;
}
```

### 2.14 Search Input

```tsx
// src/shared/ui/search-input.tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### 2.15 Sidebar

```tsx
// src/shared/ui/sidebar.tsx
interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}
```

### 2.16 Skeleton

```tsx
// src/shared/ui/skeleton.ui.tsx
interface SkeletonProps {
  className?: string;
}
```

### 2.17 Stats Card

```tsx
// src/shared/ui/stats-card.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}
```

### 2.18 Tabs

```tsx
// src/shared/ui/tabs.tsx
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

### 2.19 Topbar

```tsx
// src/shared/ui/topbar.tsx
interface TopbarProps {
  user?: {
    name: string;
    avatar?: string;
  };
}
```

---

## 3. Padrões de API

### 3.1 Props Comuns

```tsx
// Estender props nativas do elemento HTML
interface ComponentProps extends ComponentPropsWithoutRef<"element"> {
  // Props customizadas
  variant?: "default" | "variant1" | "variant2";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
}

// Prop drilling prevention - usar generic se necessário
interface WithClassName {
  className?: string;
}
```

### 3.2 Naming Conventions

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | PascalCase | `BookCard` |
| Props | camelCase | `onPageChange` |
| Boolean | prefix `is`/`has`/`can` | `isLoading`, `hasError` |
| Variant | prefix de comportamento | `variant="primary"` |
| Event Handler | prefix `on` | `onClick`, `onChange` |

### 3.3 Forward Ref

```tsx
export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={className} {...props} />;
  }
);
Component.displayName = "Component";
```

---

## 4. Estilização

### 4.1 Tailwind CSS

```tsx
// Usar cn() utility para merging de classes
import { cn } from "@/utils/cn";

<div className={cn(
  "base-classes",
  variant === "primary" && "variant-classes",
  className
)} />
```

### 4.2 CVA (Class Variance Authority)

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & ComponentProps<"button">;
```

---

## 5. Boas Práticas

### 5.1 Separação de Responsabilidades

- ❌ NÃO: Componentes com estado ou lógica de negócio
- ✅ FAZER: Componentes apenas com props e renderização

```tsx
// ❌ ERRADO - Componente com lógica
export function BookList() {
  const [books, setBooks] = useState([]);
  // lógica...
  return <ul>{books.map(b => <li>{b.title}</li>)}</ul>;
}

// ✅ CORRETO - Componente UI puro
export function BookListUi({ books }: { books: Book[] }) {
  return <ul>{books.map(b => <li>{b.title}</li>)}</ul>;
}
```

### 5.2 Composição

```tsx
// Composição de componentes UI
function BookCardUi({ book }: { book: Book }) {
  return (
    <Card>
      <BookCover coverUrl={book.coverUrl} title={book.title} />
      <div>
        <Title>{book.title}</Title>
        <Subtitle>{book.author}</Subtitle>
      </div>
    </Card>
  );
}
```

### 5.3 Tipagem Estrita

```tsx
// ✅ Sempre tipar props explicitamente
interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
  };
}

// ✅ Usar tipos existentes quando possível
import { Book } from "@/features/book-dashboard/types/book.types";
interface BookCardProps {
  book: Book;
}
```

---

## Acceptance Criteria

- [ ] Componentes seguem extensão `.ui.tsx`
- [ ] Usar `forwardRef` para expor DOM nodes
- [ ] Display name definido para debugging
- [ ] Props estendem ComponentPropsWithoutRef quando apropriado
- [ ] Usar `cn()` utility para merging de classes
- [ ] Componentes não têm estado interno (useState)
- [ ] Componentes não fazem fetch de dados diretamente
- [ ] Componentes são puramente presentacionais
