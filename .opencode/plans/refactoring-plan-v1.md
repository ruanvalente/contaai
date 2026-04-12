# Plano de Refatoração Arquitetural - Conta.AI

## Visão Geral

Este documento apresenta um plano de refatoração incremental para a aplicação Conta.AI, com foco em:
- Redução de complexidade em features grandes
- Melhoria de legibilidade e manutenção
- Separação clara de responsabilidades
- Adoção de arquitetura Vertical Slice + Feature Encapsulation

**Baseado em:** Análise da codebase + specs do projeto (`.opencode/specs/`)

---

## 📊 Problemas Identificados na Arquitetura Atual

### 1. Features Acopladas
- `book-dashboard` possui ~50 arquivos com múltiplas responsabilidades
- Mistura de UI, lógica, domínio, e estado na mesma feature

### 2. Duplicação de Conceitos
- `domain/` existe em root (`src/domain/`) E dentro de features
- Conflito entre entidades globais e locais

### 3. Hooks com Regras de Negócio
- `use-favorites.ts` contém lógica de negócio (add/remove favorite)
- Deveria apenas orquestrar estado, não regras

### 4. shared/ui Crescendo Descontroladamente
- 27 arquivos em `shared/ui/`, muitos específicos de dominio
- Falta boundary clara entre componentes genéricos vs específicos

### 5. app/ Não é Camada Fina
- `app/book-dashboard/page.tsx` contém lógica que deveria estar em features

---

## 🪜 Etapas do Plano de Refatoração

### Etapa 1: Estabelecer Arquitetura de Diretórios
**Objetivo:** Criar a estrutura base para Vertical Slice

| Item | Detalhe |
|------|---------|
| **Risco** | Baixo |
| **Impacto** | Estrutural |
| **Dependências** | Nenhuma |
| **Duração** | 1 dia |

#### Ações Técnicas

**1.1 Criar estrutura de camadas por feature:**

```
src/features/
├── [feature]/
│   ├── application/     # Casos de uso (NOVO)
│   ├── domain/        # Entidades + regras (já existe)
│   ├── infrastructure/ # Integrações externas (já existe)
│   ├── presentation/  # Páginas + Componentes (já existe)
│   ├── hooks/        # hooks específicos (já existe)
│   └── index.ts     # API pública (CRIAR)
```

**1.2 Padronizar index.ts por feature:**

```typescript
// src/features/book-dashboard/index.ts

// Exports públicos da feature
export type { Book, UserBook, CreateBookInput } from "./domain/types/book.types";
export { BookStatus } from "./domain/types/book.types";

export { getBooksAction, createBookAction } from "./application/commands";
export { getBooksQuery, getUserBooksQuery } from "./application/queries";

export { BookCardWidget } from "./presentation/widgets/book-card.widget";
export { BookEditorWidget } from "./presentation/widgets/book-editor.widget";
export { LibraryContentWidget } from "./presentation/widgets/library-content.widget";
```

**1.3 Criar barrel exports para cada camada:**

```
src/features/book-dashboard/
├── application/
│   ├── commands/
│   │   ├── index.ts    # Exporta todos os commands
│   │   └── create-book.command.ts
│   └── queries/
│       ├── index.ts   # Exporta todas as queries
│       └── get-books.query.ts
```

#### Estratégia de Validação
- [ ] Todas as features têm `index.ts` exportando API pública
- [ ] Imports internos usam caminhos relativos
- [ ] Nenhum arquivo fora das camadas definidas

#### Rollback
- Reverter mudanças de estrutura com git

---

### Etapa 2: Quebrar book-dashboard em Sub-Features
**Objetivo:** Reduzir complexidade da maior feature

| Item | Detalhe |
|------|---------|
| **Risco** | Médio |
| **Impacto** | Alto |
| **Dependências** | Etapa 1 |
| **Duração** | 3 dias |

#### Análise do Problema

`book-dashboard` atual contém:
- Gestão de livros (CRUD)
- Editor de conteúdo (Lexical)
- Biblioteca pessoal
- Categorias
- Downloads
- Favoritos
- Busca e recomendação

Isso são **6 funcionalidades distintas** que deveriam ser sub-features independentes.

#### Ações Técnicas

**2.1 Identificar sub-features:**

```
book-dashboard/ →拆分
├── book-management/     # CRUD de livros (NOVO)
├── book-editor/        # Editor Lexical (JA EXISTE - editor/)
├── user-library/     # Biblioteca pessoal (JA EXISTE - library/)
├── book-categories/   # Categorias (NOVO)
├── book-downloads/   # Downloads (NOVO)
├── book-search/       # Busca e recomendações (NOVO)
```

**2.2 Reorganizar arquivos - ANTES/DEPOIS:**

**ANTES (book-dashboard atual):**
```
book-dashboard/
├── actions/
│   ├── books.actions.ts
│   ├── user-books.actions.ts
│   └── user-favorites.actions.ts
├── hooks/
│   ├── use-books.ts
│   ├── use-books-with-cache.ts
│   ├── use-categories.ts
│   └── use-selected-book.ts
├── presentation/
│   ├── widgets/
│   │   ├── book-card.widget.tsx
│   │   ├── create-book-modal.widget.tsx
│   │   ├── library-content.widget.tsx
│   │   └── ...
```

**DEPOIS (sub-features):**
```
book-dashboard/
├── book-management/
│   ├── application/
│   │   ├── commands/
│   │   │   ├── create-book.command.ts
│   │   │   ├── update-book.command.ts
│   │   │   └── delete-book.command.ts
│   │   └── queries/
│   │       ├── get-books.query.ts
│   │       └── get-book-by-id.query.ts
│   ├── domain/
│   │   ├── types/book.types.ts
│   │   └── validators/book.validator.ts
│   ├── presentation/
│   │   ├── widgets/
│   │   │   ├── book-card.widget.tsx
│   │   │   └── create-book-modal.widget.tsx
│   └── index.ts
│
├── book-editor/
│   ├── hooks/
│   │   ├── use-book-editor.ts
│   │   └── use-editor-toolbar.ts
│   ├── plugins/
│   │   ├── auto-save.plugin.tsx
│   │   └── initial-content.plugin.tsx
│   ├── presentation/
│   │   └── widgets/
│   │       └── book-editor.widget.tsx
│   └── index.ts
│
├── user-library/
│   ├── application/
│   │   ├── commands/
│   │   │   └── update-reading-status.command.ts
│   │   └── queries/
│   │       └── get-user-books.query.ts
│   ├── hooks/
│   │   └── use-user-books.ts
│   ├── presentation/
│   │   └── widgets/
│   │       └── library-content.widget.tsx
│   └── index.ts
```

**2.3 Mover arquivos usando script:**

```bash
# Pseudocódigo para reorganização
mv book-dashboard/actions/books.actions.ts book-management/application/commands/
mv book-dashboard/actions/user-books.actions.ts user-library/application/commands/
mv book-dashboard/presentation/widgets/book-card.widget.tsx book-management/presentation/widgets/
```

#### Regras de Dependência entre Sub-Features

```
book-management (core)
    ↑
    ├── book-editor (depende de book-management)
    ├── user-library (depende de book-management)
    └── book-categories (depende de book-management)
```

**Dependência Circular Proibida:**
```
user-library → book-search ❌
book-search → user-library ❌
```

#### Estratégia de Validação
- [ ] Cada sub-feature tem seu próprio `index.ts`
- [ ] Testes unitários passam
- [ ] Navegação entre rotas funciona
- [ ] Sem dependências circulares (verificar com `npm run lint`)

#### Rollback
```bash
git stash  # Salvar estado atual
git checkout -- .  # Restaurar estado anterior
```

---

### Etapa 3: Separar Hooks de Regras de Negócio
**Objetivo:** Aplicar SPEC hooks-spec.md

| Item | Detalhe |
|------|---------|
| **Risco** | Médio |
| **Impacto** | Médio |
| **Dependências** | Etapa 1, 2 |
| **Duração** | 2 dias |

#### Identificar Hooks Problemáticos

**3.1 Hooks com lógica de negócio (mover para application/):**

| Hook Atual | Problem | Novo Local |
|-----------|---------|------------|
| `use-favorites.ts` | Contém add/remove favorite | `features/discovery/application/commands/favorite.command.ts` |
| `use-books.ts` | Contém lógica de fetch | `features/book-management/application/queries/get-books.query.ts` |
| `use-user-books.ts` | Contém lógica de fetch | `features/user-library/application/queries/get-user-books.query.ts` |

**3.2 Hooks de orchestration (manter em hooks/):**

| Hook | Função | Novo Local |
|------|-------|------------|
| `use-search.ts` | Apenas estado de UI | `features/book-search/hooks/use-search-state.ts` |
| `use-sidebar.ts` | Toggle UI | `src/shared/hooks/use-sidebar.ts` |
| `use-library-tabs.ts` | Estado de abas | `features/user-library/hooks/use-library-tabs.ts` |

#### ANTES vs DEPOIS

**ANTES (src/shared/hooks/use-favorites.ts):**
```typescript
// ❌ ERRO: Contém regra de negócio
export function useFavorites() {
  const addFavorite = async (book: Book) => {
    // Lógica de negócio aqui!
    await addToFavorites(book.id, book.title, book.author);
    // Atualização de store...
  };
}
```

**DEPOIS:**
```typescript
// application/commands/favorite.command.ts
// ✅ REGRA DE NEGÓCIO
export async function addFavoriteCommand(book: Book): Promise<void> {
  await addToFavorites(book.id, book.title, book.author);
}

// hooks/use-favorites.ts (NOVO)
// ✅ APENAS ORCHESTRATION
export function useFavorites() {
  const { addFavoriteCommand } = useFavoritesCommands();
  
  const addFavorite = useCallback(async (book: Book) => {
    await addFavoriteCommand(book);
  }, [addFavoriteCommand]);
  
  return { addFavorite };
}
```

#### Estratégia de Validação
- [ ] Hooks não contêm Server Actions diretas
- [ ] Regras de negócio estão em application/
- [ ] Testes de integração passam

#### Rollback
```bash
git stash
git checkout -- .
```

---

### Etapa 4: Consolidar domain/ Global e Local
**Objetivo:** Eliminar duplicação entre `src/domain/` e `features/*/domain/`

| Item | Detalhe |
|------|---------|
| **Risco** | Alto |
| **Impacto** | Alto |
| **Dependências** | Etapa 2 |
| **Duração** | 2 dias |

#### Problema Identificado

```
src/domain/                          features/book-dashboard/domain/
├── entities/                       ├── types/book.types.ts
│   ├── book.entity.ts      ←─────→   └── Book (mesmo conceito!)
│   └── user.entity.ts             └── UserBook (细分)
```

#### Solução Proposta

**4.1 Domain Global apenas para conceitos compartilhados:**

```
src/domain/
├── entities/              # ONLY conceitos compartilhados globalmente
│   ├── user.entity.ts    # User (conceito global)
│   ├── reading-progress.entity.ts  # Progress (compartilhado)
│   └── index.ts
├── repositories/        # ONLY interfaces abstratas
│   ├── book.repository.ts   # Interface
│   └── user.repository.ts # Interface
└── usecases/          # ONLY usecases globais
    ├── favorite-book.usecase.ts
    └── save-reading-progress.usecase.ts
```

**4.2 Feature domains para tipos específicos:**

```
features/book-management/domain/
├── types/                     # Tipos específicos
│   ├── book.types.ts
│   └── create-book.types.ts
├── validators/                # Validação específica
│   └── book.validator.ts
└── index.ts                  # Expõe para outras features
```

**4.3 Eliminar arquivos duplicados:**

| Arquivo Duplicado | Ação |
|-----------------|------|
| `src/domain/entities/book.entity.ts` | Remover (tipos em feature) |
| `src/domain/usecases/get-books.usecase.ts` | Mover para feature |

#### Estratégia de Validação
- [ ] Apenas entidades globais em `src/domain/`
- [ ] Tipos específicos em features
- [ ] Funcionamento idêntico após refatoração

#### Rollback
```bash
git checkout -- src/domain/
git checkout -- features/*/domain/
```

---

### Etapa 5: Separar shared/ui de domain-specific
**Objetivo:** Aplicar UI/Widget spec corretamente

| Item | Detalhe |
|------|---------|
| **Risco** | Médio |
| **Impacto** | Médio |
| **Dependências** | Etapa 2 |
| **Duração** | 1 dia |

#### Problema

`src/shared/ui/` contém muitos componentes específicos de domínio:

| Componente | Problem | Novo Local |
|-----------|---------|------------|
| `empty-library-state.ui.tsx` | Específico de library | `features/user-library/presentation/ui/` |
| `empty-favorites-state.ui.tsx` | Específico de favorites | `features/book-management/presentation/ui/` |
| `favorites-header.ui.tsx` | Específico de favorites | `features/book-management/presentation/ui/` |
| `library-header.ui.tsx` | Específico de library | `features/user-library/presentation/ui/` |

#### Solução

**5.1 Componentes genéricos (manter em shared/ui/):**
- `button.tsx`
- `badge.tsx`
- `avatar.tsx`
- `skeleton.ui.tsx`
- `container.tsx`
- `tabs.tsx`

**5.2 Componentes específicos (mover para features):**

```
features/book-management/
└── presentation/
    └── ui/
        ├── empty-favorites-state.ui.tsx     # MOVER
        └── favorites-header.ui.tsx          # MOVER

features/user-library/
└── presentation/
    └── ui/
        ├── empty-library-state.ui.tsx    # MOVER
        └── library-header.ui.tsx       # MOVER
```

#### Estratégia de Validação
- [ ] shared/ui contém apenas componentes genéricos
- [ ] Componentes específicos em features
- [ ] Nenhum componente shared/ui importa de features

#### Rollback
```bash
git checkout -- src/shared/ui/
git mv features/*/presentation/ui/* src/shared/ui/
```

---

### Etapa 6: Torna app/ Camada Fina
**Objetivo:** Aplicar next-best-practices

| Item | Detalhe |
|------|---------|
| **Risco** | Baixo |
| **Impacto** | Médio |
| **Dependências** | Etapa 2, 5 |
| **Duração** | 1 dia |

#### Problema

`app/book-dashboard/page.tsx` contém lógica de negócio:

```typescript
// app/book-dashboard/page.tsx
// ❌ ERRO: Lógica de negócio aqui
export default async function Page() {
  const books = await getBooksAction();
  const categories = await getCategoriesAction();
  
  return <Dashboard books={books} categories={categories} />;
}
```

#### Solução

**6.1 Transformar page.tsx em composição:**

```typescript
// app/book-dashboard/page.tsx
// ✅ CORRETO: Apenas composição
import { LibraryContentWidget } from "@/features/user-library/presentation/widgets/library-content.widget";
import { CategorySectionWidget } from "@/features/book-categories/presentation/widgets/category-section.widget";

export default async function Page() {
  return (
    <main>
      <LibraryContentWidget />
      <CategorySectionWidget />
    </main>
  );
}
```

**6.2 Dados buscam em Server Component wrapper:**

```typescript
// features/user-library/presentation/pages/library-page.tsx (NOVO)
import { LibraryContentWidget } from "../widgets/library-content.widget";
import { getUserBooksQuery } from "../../application/queries/get-user-books.query";

export default async function LibraryPage() {
  const userBooks = await getUserBooksQuery();
  
  return <LibraryContentWidget initialBooks={userBooks} />;
}

// app/library/page.tsx
import { LibraryPage } from "@/features/user-library/presentation/pages/library-page";

export default LibraryPage;
```

#### Estratégia de Validação
- [ ] pages em app não contêm lógica de negócio
- [ ] pages apenas importam de features
- [ ] Funcionamento idêntico

#### Rollback
```bash
git checkout -- src/app/
```

---

### Etapa 7: Padronização de Conventions
**Objetivo:** Definir padrões finais

| Item | Detalhe |
|------|---------|
| **Risco** | Baixo |
| **Impacto** | Baixo |
| **Dependências** | Todas |
| **Duração** | 1 dia |

#### Ações

**7.1 Criar eslint rules para arquitetura:**

```javascript
// .eslintrc.json (adicionar)
{
  "rules": {
    "no-import-features-from-shared": "error",
    "no-business-logic-in-hooks": "error",
    "no-logic-in-components": "error"
  }
}
```

**7.2 Criar template para nova feature:**

```
scripts/templates/
└── feature/
    ├── index.ts
    ├── application/
    │   ├── commands/
    │   └── queries/
    ├── domain/
    │   ├── types/
    │   └── validators/
    ├── presentation/
    │   ├── pages/
    │   ├── widgets/
    │   └── ui/
    └── hooks/
        └── index.ts
```

**7.3 Documentar padrões:**

```markdown
# CONVENTIONS.md

## Estrutura de Feature
```
feature/
├── application/    # Casos de uso (commands + queries)
├── domain/       # Tipos + validadores
├── presentation # Componentes de UI
│   ├── pages/  # Entrypoints
│   ├── widgets/
│   └── ui/
├── hooks/       # Estado local (sem lógica de negócio)
└── index.ts   # API pública
```

## Regras de Dependência
- shared → features: ❌
- features → features: ✅ (seindex)
- app → features: ✅
- features → shared: ✅

## Padrão de Commits
- refactor(feature):拆分 book-dashboard
- refactor(hook): mover lógica para application
- refactor(domain): consolidar entidades
```

---

## 📁 Estrutura Final Sugerida

### features/

```
src/features/
├── auth/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   ├── domain/
│   ├── presentation/
│   │   ├── pages/
│   │   ├── widgets/
│   │   └── ui/
│   └── index.ts
│
├── book-management/     # NOVO (拆分 de book-dashboard)
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── presentation/
│   └── index.ts
│
├── book-editor/        # JÁ EXISTE (editor/)
│   ├── plugins/
│   ├── presentation/
│   └── index.ts
│
├── book-categories/    # NOVO
│   ├── application/
│   ├── domain/
│   ├── presentation/
│   └── index.ts
│
├── book-search/       # NOVO
│   ├── application/
│   ├── domain/
│   ├── presentation/
│   └── index.ts
│
├── user-library/     # JÁ EXISTE (library/)
│   ├── application/
│   ├── domain/
│   ├── presentation/
│   └── index.ts
│
├── user-profile/     # JÁ EXISTE (profile/)
│   ├── application/
│   ├── domain/
│   ├── presentation/
│   └── index.ts
│
├── reading/         # JÁ EXISTE
│   ├── application/
│   ├── domain/
│   ├── presentation/
│   └── index.ts
│
└── discovery/      # MANTER
    ├── application/
    ├── domain/
    ├── presentation/
    └── index.ts
```

### shared/

```
src/shared/
├── ui/                    # apenas genéricos
│   ├── button.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── skeleton.ui.tsx
│   ├── container.tsx
│   ├── tabs.tsx
│   └── index.ts
│
├── widgets/               # orchestration
│   ├── dashboard-shell.widget.tsx
│   ├── user-dropdown.widget.tsx
│   └── index.ts
│
├── hooks/               # estado local
│   ├── use-sidebar.ts
│   ├── use-hydrated.ts
│   └── index.ts
│
├── store/              # estado global
│   ├── sidebar.store.ts
│   └── index.ts
│
├── config/
│   └── supabase.ts
│
└── utils/
    └── cn.ts
```

### domain/

```
src/domain/
├── entities/           # apenas globais
│   ├── user.entity.ts
│   ├── reading-progress.entity.ts
│   └── index.ts
├── repositories/      # interfaces
│   └── index.ts
└── index.ts
```

### app/

```
src/app/                  # APENAS entrypoints
├── layout.tsx
├── page.tsx
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
│   ├── library/
│   ├── favorites/
│   ├── settings/
│   ├── category/
│   └── editor/
│       └── [id]/
└── book/
    └── [id]/
```

---

## 📋 Checklist de Execução

| Etapa | Task | Status | Priority |
|-------|------|--------|----------|
| 1 | Estabelecer arquitetura de diretórios | ⬜ | Alta |
| 2 | Quebrar book-dashboard | ⬜ | Alta |
| 3 | Separar hooks de regras | ⬜ | Alta |
| 4 | Consolidar domain | ⬜ | Média |
| 5 | Separar shared/ui | ⬜ | Média |
| 6 | Tornar app/ camada fina | ⬜ | Baixa |
| 7 | Padronizar conventions | ⬜ | Baixa |

---

## 🔄 Exemplo Real: Refatorando book-dashboard

### Passo 1: Identificar sub-features

```bash
# Analyzer book-dashboard para identificar dependências
ls -la src/features/book-dashboard/
```

**Resultado:**
- Editor (Lexical) → sub-feature independente
- Library → sub-feature independente
- Categories → sub-feature independente
- Books CRUD → core feature
- Search → sub-feature independente

### Passo 2: Criar estrutura

```bash
# Criar diretórios
mkdir -p src/features/book-management
mkdir -p src/features/book-categories
mkdir -p src/features/book-search

# Mover arquivos
mv src/features/book-dashboard/commands src/features/book-management/application/
mv src/features/book-dashboard/queries src/features/book-management/application/
mv src/features/book-dashboard/types src/features/book-management/domain/
```

### Passo 3: Criar index.ts

```typescript
// src/features/book-management/index.ts
export type { Book, CreateBookInput } from "./domain/types/book.types";
export { BookStatus } from "./domain/types/book.types";

export { createBookCommand, updateBookCommand } from "./application/commands";
export { getBooksQuery } from "./application/queries";

export { BookCardWidget } from "./presentation/widgets/book-card.widget";
export { CreateBookModalWidget } from "./presentation/widgets/create-book-modal.widget";
```

### Passo 4: Atualizar imports

```typescript
# Antes
import { BookCard } from "@/features/book-dashboard/presentation/widgets/book-card.widget";

# Depois
import { BookCardWidget } from "@/features/book-management";
```

---

## 🛠️ Automação Sugerida

### eslint-plugin-arquitectura

Criar rules customizadas:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Proibir lógica de negócio em hooks
    'no-business-logic-in-hooks': {
      'hooks': ['useFavorites', 'useBooks'],
      'pattern': /await.*Action/,
      'message': 'Hooks devem apenas orquestrar, não chamar Server Actions diretamente'
    },
    
    // Proibir imports de features em shared/ui
    'no-domain-specific-in-shared-ui': {
      'from': 'shared/ui',
      'pattern': /features\\//,
      'message': 'shared/ui deve conter apenas componentes genéricos'
    },
    
    // Verificar dependências circulares
    'no-circular-dependencies': {
      'pattern': /features\\/*\\/index\\.ts/
    }
  }
}
```

### Script de Validação

```bash
#!/bin/bash
# validate-architecture.sh

echo "Verificando dependências circulares..."
npx depcruise src/features --include-only "^src/features" --output-type err

echo "Verificando hooks..."
grep -r "await.*Action" src/shared/hooks/ || echo "OK: Nenhum Server Action em hooks"

echo "Verificando shared/ui..."
for file in src/shared/ui/*.tsx; do
  grep -q "from.*features" "$file" && echo "WARN: $file pode ser específico"
done
```

---

## 📝 Boas Práticas Adicionais

### Padrão de Commits

```bash
# Formato
[tipo](escopo): descrição

# Exemplos
refactor(book-dashboard):拆分 em sub-features
refactor(hook): mover lógica de favorito para command
refactor(domain): consolidar entidades globais
feat(shared): adicionar componente Button genérico
docs(conventions): adicionar guia de arquitetura
```

### Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Command | `*.command.ts` | `create-book.command.ts` |
| Query | `*.query.ts` | `get-books.query.ts` |
| UI | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `book-card.widget.tsx` |
| Hook | `use-*.ts` | `use-sidebar.ts` |
| Store | `*.store.ts` | `favorites.store.ts` |
| Page | `page.tsx` | `library/page.tsx` |

### Estratégia de Testes

```
feature/
├── application/
│   ├── commands/
│   │   └── create-book.command.spec.ts  # Testar comando
│   │
│   └��─ queries/
│       └── get-books.query.spec.ts     # Testar query
│
├── domain/
│   └── validators/
│       └── book.validator.spec.ts     # Testar validação
│
└── presentation/
    ├── widgets/
    │   └── book-card.widget.spec.tsx  # Testar widget
    │
    └── ui/
        └── button.ui.spec.tsx       # Testar UI
```

---

## ✅ Resultado Esperado

Ao final das 7 etapas, o projeto terá:

- [ ] Features independentes e encapsuladas
- [ ] Estrutura clara: application/domain/presentation/infrastructure
- [ ] Hooks apenas para orquestração (sem regras de negócio)
- [ ] domain/ global para conceitos compartilhados
- [ ] shared/ para componentes genéricos
- [ ] app/ como camada fina de entrypoints
- [ ] Conventions documentadas e aplicadas
- [ ] Possibilidade de adicionar features sem耦合 existing

---

## 📚 Referências

- `.opencode/specs/project-structure-spec.md`
- `.opencode/specs/hooks-spec.md`
- `.opencode/specs/ui-component-spec.md`
- `.opencode/specs/widget-component-spec.md`
- `.agents/skills/vercel-react-best-practices/`
- `.agents/skills/next-best-practices/`

---

*Plano gerado automaticamente com base na análise da codebase*
*Versão: 1.0*
*Data: 2026-04-08*