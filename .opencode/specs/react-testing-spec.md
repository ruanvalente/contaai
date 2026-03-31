# React Testing Specification

## Description
Este documento define a especificação para testes de componentes React usando Vitest e Testing Library na aplicação Conta.AI.

## Baseado em
- JavaScript Testing Patterns Skill (`.agents/skills/wshobson-agents/plugins/javascript-typescript/skills/javascript-testing-patterns/`)
- React Testing Library

---

## 1. Configuração

### 1.1 Dependências

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^24.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 1.2 Setup com Jest DOM

```typescript
// src/test/setup.ts
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

vi.clearAllMocks();
```

### 1.3 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
```

---

## 2. Testando Componentes UI

### 2.1 Componente Simples

```tsx
// src/shared/ui/button.ui.tsx
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonUiProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const ButtonUi = forwardRef<HTMLButtonElement, ButtonUiProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          size === "sm" && "btn-sm",
          size === "md" && "btn-md",
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

### 2.2 Teste do Componente

```tsx
// src/shared/ui/button.ui.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ButtonUi } from "./button.ui";

describe("ButtonUi", () => {
  describe("rendering", () => {
    it("renders button with children", () => {
      render(<ButtonUi>Click me</ButtonUi>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("renders with custom className", () => {
      const { container } = render(
        <ButtonUi className="custom-class">Button</ButtonUi>
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<ButtonUi onClick={handleClick}>Click me</ButtonUi>);
      
      await user.click(screen.getByRole("button"));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <ButtonUi onClick={handleClick} disabled>
          Click me
        </ButtonUi>
      );
      
      await user.click(screen.getByRole("button"));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("has correct button role", () => {
      render(<ButtonUi>Button</ButtonUi>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("is accessible by keyboard", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<ButtonUi onClick={handleClick}>Button</ButtonUi>);
      
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## 3. Testando Widgets

### 3.1 Widget com Estado

```tsx
// src/shared/widgets/counter.widget.tsx
"use client";

import { useState } from "react";

interface CounterWidgetProps {
  initialCount?: number;
  onChange?: (count: number) => void;
}

export function CounterWidget({ 
  initialCount = 0, 
  onChange 
}: CounterWidgetProps) {
  const [count, setCount] = useState(initialCount);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    onChange?.(newCount);
  };

  const decrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    onChange?.(newCount);
  };

  return (
    <div data-testid="counter">
      <button 
        data-testid="decrement" 
        onClick={decrement}
        aria-label="Decrement"
      >
        -
      </button>
      <span data-testid="count">{count}</span>
      <button 
        data-testid="increment" 
        onClick={increment}
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}
```

### 3.2 Teste do Widget

```tsx
// src/shared/widgets/counter.widget.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CounterWidget } from "./counter.widget";

describe("CounterWidget", () => {
  it("renders with initial count", () => {
    render(<CounterWidget initialCount={5} />);
    expect(screen.getByTestId("count")).toHaveTextContent("5");
  });

  it("increments count when + is clicked", async () => {
    const user = userEvent.setup();
    render(<CounterWidget initialCount={0} />);
    
    await user.click(screen.getByTestId("increment"));
    
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("decrements count when - is clicked", async () => {
    const user = userEvent.setup();
    render(<CounterWidget initialCount={5} />);
    
    await user.click(screen.getByTestId("decrement"));
    
    expect(screen.getByTestId("count")).toHaveTextContent("4");
  });

  it("calls onChange callback", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<CounterWidget initialCount={0} onChange={handleChange} />);
    
    await user.click(screen.getByTestId("increment"));
    
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it("has accessible labels", () => {
    render(<CounterWidget />);
    
    expect(screen.getByLabelText("Increment")).toBeInTheDocument();
    expect(screen.getByLabelText("Decrement")).toBeInTheDocument();
  });
});
```

---

## 4. Testando Componentes com Hooks

### 4.1 Componente com Hook

```tsx
// src/shared/widgets/search.widget.tsx
"use client";

import { useState } from "react";
import { useDebouncedSearch } from "@/shared/hooks/use-search";

interface SearchWidgetProps {
  onSearch: (query: string) => void;
}

export function SearchWidget({ onSearch }: SearchWidgetProps) {
  const [query, setQuery] = useState("");
  const { debouncedQuery } = useDebouncedSearch(query, 300);

  return (
    <div>
      <input
        data-testid="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {debouncedQuery && (
        <p data-testid="searching">Searching for "{debouncedQuery}"...</p>
      )}
    </div>
  );
}
```

### 4.2 Teste com Hook

```tsx
// src/shared/widgets/search.widget.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchWidget } from "./search.widget";

describe("SearchWidget", () => {
  it("renders search input", () => {
    render(<SearchWidget onSearch={vi.fn()} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("updates input value on change", async () => {
    const user = userEvent.setup();
    render(<SearchWidget onSearch={vi.fn()} />);
    
    const input = screen.getByTestId("search-input");
    await user.type(input, "hello");
    
    expect(input).toHaveValue("hello");
  });
});
```

---

## 5. Testando Componentes com Async

### 5.1 Componente Async

```tsx
// src/shared/widgets/book-list.widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Book } from "@/features/book-dashboard/types/book.types";

interface BookListWidgetProps {
  onLoad: () => Promise<Book[]>;
}

export function BookListWidget({ onLoad }: BookListWidgetProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await onLoad();
        setBooks(data);
      } catch (err) {
        setError("Failed to load books");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onLoad]);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <ul data-testid="book-list">
      {books.map((book) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
}
```

### 5.2 Teste Async

```tsx
// src/shared/widgets/book-list.widget.spec.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BookListWidget } from "./book-list.widget";

const mockBooks = [
  { id: "1", title: "Book 1", author: "Author 1" },
  { id: "2", title: "Book 2", author: "Author 2" },
];

describe("BookListWidget", () => {
  it("shows loading state initially", () => {
    const loadFn = vi.fn().mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    
    render(<BookListWidget onLoad={loadFn} />);
    
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("loads and displays books", async () => {
    const loadFn = vi.fn().mockResolvedValue(mockBooks);
    
    render(<BookListWidget onLoad={loadFn} />);
    
    await waitFor(() => {
      expect(screen.getByTestId("book-list")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Book 1")).toBeInTheDocument();
    expect(screen.getByText("Book 2")).toBeInTheDocument();
  });

  it("shows error on failure", async () => {
    const loadFn = vi.fn().mockRejectedValue(new Error("API Error"));
    
    render(<BookListWidget onLoad={loadFn} />);
    
    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
    
    expect(screen.getByTestId("error")).toHaveTextContent("Failed to load books");
  });
});
```

---

## 6. Queries Mais Comuns

### 6.1 Queries por Role

```tsx
// Mais preferível - acessível
screen.getByRole("button", { name: /submit/i });
screen.getByRole("textbox", { name: /email/i });
screen.getByRole("heading", { level: 1 });
screen.getByRole("img", { name: /book cover/i });
```

### 6.2 Queries por Label

```tsx
// Bom para formulários
screen.getByLabelText(/email/i);
screen.getByLabelText("Password");
```

### 6.3 Queries por Test ID

```tsx
// Último recurso - quando não há semantics
screen.getByTestId("custom-element");
```

### 6.4 Queries por Texto

```tsx
screen.getByText("Hello World");
screen.getByText(/book \d+/i);
```

---

## 7. User Events

### 7.1 Tipos de Interação

```tsx
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

await user.click(button);
await user.dblClick(button);
await user.rightClick(button);

await user.type(input, "text");
await user.type(input, "Hello{Backspace}");

await user.selectOptions(select, "option-value");
await user.deselectOptions(select, "option-value");

await user.check(checkbox);
await user.uncheck(checkbox);

await user.keyboard("{Enter}");
await user.keyboard("ctrl+a");
```

---

## 8. Boas Práticas

### 8.1 Preferir Queries Acessíveis

```tsx
// ✅ Mais acessível
<button aria-label="Close modal">×</button>
<button>Submit</button>
<input aria-label="Search" />

// ❌ Menos acessível
<button className="close-btn">×</button>
<div onClick={...}>
```

### 8.2 Testar Comportamento, Não Implementação

```tsx
// ✅ Testar comportamento
it("shows error message when form is invalid", async () => {
  render(<Form />);
  await user.click(submitButton);
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

// ❌ Testar implementação
it("sets error state to true", () => {
  const { result } = renderHook(() => useForm());
  act(() => result.current.submit());
  expect(result.current.hasError).toBe(true);
});
```

### 8.3Arrange-Act-Assert

```tsx
describe("Feature", () => {
  it("should do something", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Component />);
    
    // Act
    await user.click(button);
    
    // Assert
    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
```

---

## Acceptance Criteria

- [ ] Testes usam @testing-library/react
- [ ] userEvent para interações de usuário
- [ ] Queries por role quando possível
- [ ] Testes são independentes
- [ ] Cleanup após cada teste
- [ ] Nomeação descritiva
- [ ] Teste de estados: loading, error, success
- [ ] Teste de acessibilidade
- [ ] Teste de keyboard navigation
