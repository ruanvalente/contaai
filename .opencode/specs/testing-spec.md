# Testing Specification

## Description
Este documento define a especificação para estratégia de testes na aplicação Conta.AI.

## Baseado em
- JavaScript Testing Patterns Skill (`.agents/skills/wshobson-agents/plugins/javascript-typescript/skills/javascript-testing-patterns/`)
- Vitest como framework de testes

---

## 1. Configuração

### 1.1 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/*.d.ts",
        "**/*.config.ts",
        "**/dist/**",
        "**/node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 1.2 Setup File

```typescript
// src/test/setup.ts
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock de Next.js
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));
```

---

## 2. Estrutura de Testes

### 2.1 Arquivos de Teste

```
src/
├── shared/
│   ├── ui/
│   │   ├── button.ui.tsx
│   │   └── button.ui.spec.tsx      # Testes do componente
│   ├── hooks/
│   │   ├── use-example.ts
│   │   └── use-example.spec.ts     # Testes do hook
│   └── store/
│       ├── example.store.ts
│       └── example.store.spec.ts   # Testes da store
├── features/
│   └── book-dashboard/
│       ├── actions/
│       │   ├── books.actions.ts
│       │   └── books.actions.spec.ts
│       └── widgets/
│           └── book-card.widget.tsx
│               └── book-card.widget.spec.tsx
```

### 2.2 Naming Conventions

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Unit Test | `*.spec.ts` | `calculator.spec.ts` |
| Component Test | `*.spec.tsx` | `Button.spec.tsx` |
| Integration | `*.integration.spec.ts` | `auth.integration.spec.ts` |
| E2E | `*.e2e.spec.ts` | `login.e2e.spec.ts` |

---

## 3. Testes de Componentes

### 3.1 UI Components

```tsx
// src/shared/ui/button.ui.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ButtonUi } from "./button.ui";

describe("ButtonUi", () => {
  it("renders children correctly", () => {
    render(<ButtonUi>Click me</ButtonUi>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<ButtonUi onClick={handleClick}>Click me</ButtonUi>);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes", () => {
    const { container } = render(<ButtonUi variant="primary">Button</ButtonUi>);
    expect(container.firstChild).toHaveClass("bg-primary");
  });

  it("is disabled when loading", () => {
    const { container } = render(<ButtonUi isLoading>Button</ButtonUi>);
    expect(container.firstChild).toBeDisabled();
  });
});
```

### 3.2 Widgets

```tsx
// src/shared/widgets/book-card.widget.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookCardWidget } from "./book-card.widget";

const mockBook = {
  id: "1",
  title: "Test Book",
  author: "Test Author",
  coverColor: "#8B4513",
};

describe("BookCardWidget", () => {
  it("renders book information", () => {
    render(<BookCardWidget book={mockBook} />);
    
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("calls onClick with book id", () => {
    const handleClick = vi.fn();
    render(<BookCardWidget book={mockBook} onClick={handleClick} />);
    
    // interactions...
    expect(handleClick).toHaveBeenCalledWith(mockBook.id);
  });
});
```

---

## 4. Testes de Hooks

### 4.1 Hook Simples

```tsx
// src/shared/hooks/use-counter.spec.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("initializes with custom value", () => {
    const { result } = renderHook(() => useCounter({ initial: 10 }));
    expect(result.current.count).toBe(10);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 4.2 Hook com Async

```tsx
// src/shared/hooks/use-books.spec.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBooks } from "./use-books";

// Mock da Server Action
vi.mock("@/features/book-dashboard/actions/books.actions", () => ({
  getBooksAction: vi.fn().mockResolvedValue([
    { id: "1", title: "Book 1" },
    { id: "2", title: "Book 2" },
  ]),
}));

describe("useBooks", () => {
  it("loads books on mount", async () => {
    const { result } = renderHook(() => useBooks());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.books).toHaveLength(2);
  });
});
```

---

## 5. Testes de Stores

### 5.1 Zustand Store

```tsx
// src/shared/store/counter.store.spec.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCounterStore } from "./counter.store";

describe("useCounterStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useCounterStore.setState({ count: 0 });
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounterStore());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it("decrements count", () => {
    useCounterStore.setState({ count: 5 });
    const { result } = renderHook(() => useCounterStore());
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
```

---

## 6. Testes de Server Actions

### 6.1 Unit Test

```tsx
// src/features/books/books.actions.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBooksAction } from "./books.actions";

// Mock do Supabase
vi.mock("@/utils/supabase/server", () => ({
  getSupabaseServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [{ id: "1", title: "Book 1" }],
          error: null,
        }),
      })),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
  })),
}));

describe("getBooksAction", () => {
  it("returns list of books", async () => {
    const books = await getBooksAction();
    
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe("Book 1");
  });
});
```

---

## 7. Testes de Integração

### 7.1 Auth Flow

```tsx
// src/features/auth/auth.integration.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuthStore } from "./use-auth-store";

describe("Auth Flow", () => {
  it("signs in successfully", async () => {
    // Mock server action
    vi.mocked(signInWithEmail).mockResolvedValue({
      success: true,
      user: { id: "1", email: "test@example.com" },
    });

    const { result } = renderHook(() => useAuthStore());
    
    await act.async(async () => {
      await result.current.signIn("test@example.com", "password");
    });

    expect(result.current.user).toBeDefined();
  });
});
```

---

## 8. Mocks

### 8.1 Mock de Módulo

```tsx
vi.mock("@/features/book-dashboard/actions/books.actions", () => ({
  getBooksAction: vi.fn().mockResolvedValue([]),
  searchBooksAction: vi.fn().mockResolvedValue([]),
}));
```

### 8.2 Mock de Componente

```tsx
// Mock de child components
vi.mock("@/shared/ui/book-cover.ui", () => ({
  BookCoverUi: ({ title }: { title: string }) => (
    <div data-testid="mock-cover">{title}</div>
  ),
}));
```

### 8.3 Mock de Hook

```tsx
vi.mock("@/shared/hooks/use-favorites", () => ({
  useFavorites: () => ({
    favoritedIds: [],
    isLoading: false,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  }),
}));
```

---

## 9. Boas Práticas

### 9.1 Estrutura AAA

```tsx
describe("Feature", () => {
  it("should do something", () => {
    // Arrange - setup
    const input = "test";
    
    // Act - execute
    const result = functionUnderTest(input);
    
    // Assert - verify
    expect(result).toBe("expected");
  });
});
```

### 9.2 Nomeação Descritiva

```tsx
// ✅ Testes descritivos
it("returns empty array when no books found");

// ❌ Testes vagos
it("works");

// ✅ Testes com comportamento esperado
it("should call onClick handler when button is clicked");

// ❌ Testes sem expectativa clara
it("should handle click");
```

### 9.3 Isolamento

```tsx
// ✅ Cada teste independente
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ✅ Não depender de ordem de testes
it("test 1", () => { });
it("test 2", () => { }); // pode rodar em qualquer ordem
```

---

## Acceptance Criteria

- [ ] Vitest configurado como framework de testes
- [ ] Arquivos de teste seguem padrão `*.spec.ts[x]`
- [ ] Setup com cleanup automático
- [ ] Mocks para dependências externas
- [ ] Testes de componentes com Testing Library
- [ ] Testes de hooks com @testing-library/react
- [ ] Testes de stores com renderHook do Vitest
- [ ] Estrutura AAA nos testes
- [ ] Nomeação descritiva para testes
