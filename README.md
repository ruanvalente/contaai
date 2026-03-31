# Conta.AI - Plataforma de Biblioteca Digital

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.0-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind CSS-4.0-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Bun-FEZF2A?style=for-the-badge&logo=bun" alt="Bun">
</p>

---

## 📋 Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Objetivo](#objetivo)
3. [Tecnologias](#tecnologias)
4. [Arquitetura do Projeto](#arquitetura-do-projeto)
5. [Modelo de Banco de Dados](#modelo-de-banco-de-dados)
6. [Funcionalidades](#funcionalidades)
7. [Configuração do Ambiente](#configuração-do-ambiente)
8. [Scripts Disponíveis](#scripts-disponíveis)
9. [Estilos e Design](#estilos-e-design)
10. [Contribuição](#contribuição)
11. [Licença](#licença)

---

## 📖 Sobre o Projeto

**Conta.AI** é uma aplicação web moderna para gerenciamento de biblioteca digital, desenvolvida com Next.js 16 (App Router), que permite aos usuários descobrir, organizar e gerenciar seus livros favoritos. A plataforma oferece uma experiência rica com sistema de favoritagem, download de livros, categorização, e até mesmo a possibilidade de criar e publicar conteúdos.

O projeto segue uma arquitetura baseada em features, com separação clara de responsabilidades entre componentes visuais (UI), componentes com lógica (Widgets), e Server Actions para operações de dados.

---

## 🎯 Objetivo

O objetivo principal do Conta.AI é fornecer uma plataforma intuitiva e elegante para:

- **Descoberta de Livros**: Navegar por uma coleção diversificada de livros categorizados
- **Gestão Pessoal**: Organizar biblioteca pessoal com status de leitura e progresso
- **Favoritos**: Marcar e gerenciar livros favoritos
- **Criação de Conteúdo**: Criar e publicar livros próprios
- **Acompanhamento de Progresso**: Registrar e visualizar progresso de leitura
- **Experiência Social**: Avaliar e revisar livros

---

## 🛠 Tecnologias

### Core

| Tecnologia     | Versão | Descrição                      |
| -------------- | ------ | ------------------------------ |
| **Next.js**    | 16.2.0 | Framework React com App Router |
| **React**      | 19.2.4 | Biblioteca de UI               |
| **TypeScript** | 5.x    | Tipagem estática               |
| **Bun**        | -      | Package manager e runtime      |

### Frontend

| Tecnologia        | Versão | Descrição                |
| ----------------- | ------ | ------------------------ |
| **Tailwind CSS**  | 4.x    | Framework de estilização |
| **Framer Motion** | 11.x   | Animações                |
| **Lexical**       | 0.12.0 | Editor de texto rico     |
| **Lucide React**  | 1.0.1  | Ícones                   |

### Backend / Dados

| Tecnologia   | Descrição                                |
| ------------ | ---------------------------------------- |
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth) |
| **Zustand**  | Gerenciamento de estado global           |

### Ferramentas de Desenvolvimento

| Tecnologia  | Descrição          |
| ----------- | ------------------ |
| **ESLint**  | Linting de código  |
| **PostCSS** | Processador de CSS |

---

## 🏗 Arquitetura do Projeto

### Estrutura de Pastas

```
conta-ai/
├── src/
│   ├── app/                    # Next.js App Router (rotas)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page (pública)
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de cadastro
│   │   ├── dashboard/         # Área autenticada
│   │   │   ├── library/      # Biblioteca do usuário
│   │   │   ├── favorites/     # Livros favoritos
│   │   │   ├── downloads/     # Downloads
│   │   │   ├── audio/         # Audiolivros
│   │   │   ├── category/      # Categorias
│   │   │   ├── settings/      # Configurações do usuário
│   │   │   └── editor/        # Editor de livros
│   │   ├── book/              # Detalhes e leitor de livros
│   │   └── book-dashboard/    # Dashboard de gerenciamento
│   │
│   ├── features/              # Domínio da aplicação
│   │   ├── auth/              # Autenticação
│   │   ├── profile/           # Perfil do usuário
│   │   ├── discovery/         # Descoberta de livros
│   │   └── book-dashboard/    # Dashboard de livros
│   │       ├── actions/      # Server Actions
│   │       ├── widgets/       # Componentes com lógica
│   │       ├── hooks/         # Hooks customizados
│   │       ├── store/         # Zustand stores
│   │       └── data/          # Dados e queries
│   │
│   ├── shared/                # Componentes reutilizáveis
│   │   ├── ui/                # Componentes visuais puros
│   │   ├── widgets/           # Componentes com lógica
│   │   ├── hooks/             # Hooks customizados
│   │   ├── store/             # Zustand stores globais
│   │   ├── config/            # Configurações
│   │   └── utils/             # Utilitários
│   │
│   ├── lib/                   # Bibliotecas e configurações
│   │   └── supabase/          # Cliente e configurações Supabase
│   │
│   └── screens/               # Páginas de dashboard (legado)
│
├── supabase/
│   ├── migrations/            # Migrações do banco de dados
│   └── ...
│
├── public/                    # Arquivos estáticos
├── .opencode/                 # Configurações do agente
└── ...
```

### Padrões Arquiteturais

#### 1. Feature-Based Architecture

Cada domínio de negócio possui sua própria pasta em `features/`, contendo:

- **actions/**: Server Actions para mutações de dados
- **widgets/**: Componentes com lógica de negócio
- **hooks/**: Hooks específicos do domínio
- **store/**: Zustand stores do domínio
- **ui/**: Componentes específicos do domínio

#### 2. Separação UI/Widgets

```
src/shared/ui/           → Componentes visuais puros (sem lógica de negócio)
src/shared/widgets/      → Componentes com estado e handlers
src/features/*/widgets/  → Componentes específicos do domínio
```

#### 3. Server/Client Components

- **Server Components** por padrão para melhor performance
- `'use client'` apenas quando necessário (interatividade)
- **Server Actions** para todas as mutações de dados

#### 4. Estado Global

- **Zustand** para estado global client-side
- **useState** para estado local de componentes

---

## 💾 Modelo de Banco de Dados

O banco de dados é baseado em PostgreSQL (via Supabase) e segue o seguinte schema:

### Tabelas Principais

#### 1. `books` - Catálogo de Livros

| Coluna         | Tipo         | Descrição               |
| -------------- | ------------ | ----------------------- |
| `id`           | UUID         | Chave primária          |
| `title`        | TEXT         | Título do livro         |
| `author`       | TEXT         | Autor                   |
| `cover_url`    | TEXT         | URL da capa             |
| `cover_color`  | TEXT         | Cor de fallback da capa |
| `description`  | TEXT         | Descrição               |
| `category`     | TEXT         | Categoria               |
| `pages`        | INTEGER      | Número de páginas       |
| `rating`       | DECIMAL(2,1) | Nota média              |
| `rating_count` | INTEGER      | Contagem de avaliações  |
| `review_count` | INTEGER      | Contagem de reviews     |
| `created_at`   | TIMESTAMPTZ  | Data de criação         |
| `updated_at`   | TIMESTAMPTZ  | Data de atualização     |

**RLS**: Leitura pública, inserção autenticada

---

#### 2. `profiles` - Perfis de Usuário

| Coluna       | Tipo        | Descrição           |
| ------------ | ----------- | ------------------- |
| `id`         | UUID        | FK para auth.users  |
| `name`       | TEXT        | Nome do usuário     |
| `avatar_url` | TEXT        | URL do avatar       |
| `created_at` | TIMESTAMPTZ | Data de criação     |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

**RLS**: Leitura pública, atualizaçãoown apenas pelo próprio usuário

**Trigger**: Criação automática na inscrição (`handle_new_user`)

---

#### 3. `ratings` - Avaliações e Reviews

| Coluna       | Tipo        | Descrição          |
| ------------ | ----------- | ------------------ |
| `id`         | UUID        | Chave primária     |
| `book_id`    | UUID        | FK para books      |
| `user_id`    | UUID        | FK para auth.users |
| `rating`     | INTEGER     | Nota (1-5)         |
| `review`     | TEXT        | Review textual     |
| `created_at` | TIMESTAMPTZ | Data de criação    |

**Constraints**: UNIQUE(book_id, user_id), CHECK(rating 1-5)

---

#### 4. `user_books` - Livros do Usuário (Criação)

| Coluna             | Tipo        | Descrição                                  |
| ------------------ | ----------- | ------------------------------------------ |
| `id`               | UUID        | Chave primária                             |
| `user_id`          | UUID        | FK para auth.users                         |
| `title`            | TEXT        | Título                                     |
| `author`           | TEXT        | Autor                                      |
| `cover_url`        | TEXT        | URL da capa                                |
| `cover_color`      | TEXT        | Cor de fallback                            |
| `content`          | TEXT        | Conteúdo do livro                          |
| `content_url`      | TEXT        | URL do conteúdo (para downloads)           |
| `status`           | TEXT        | Status (draft/published)                   |
| `reading_status`   | TEXT        | Status de leitura (none/reading/completed) |
| `reading_progress` | INTEGER     | Progresso em %                             |
| `category`         | TEXT        | Categoria                                  |
| `word_count`       | INTEGER     | Contagem de palavras                       |
| `created_at`       | TIMESTAMPTZ | Data de criação                            |
| `updated_at`       | TIMESTAMPTZ | Data de atualização                        |
| `published_at`     | TIMESTAMPTZ | Data de publicação                         |

**RLS**:

- Usuários gerenciam próprios livros
- Livros publicados são visíveis a todos

---

#### 5. `book_reading_progress` - Progresso de Leitura

| Coluna             | Tipo        | Descrição                |
| ------------------ | ----------- | ------------------------ |
| `id`               | UUID        | Chave primária           |
| `user_id`          | UUID        | FK para auth.users       |
| `book_id`          | UUID        | FK para user_books       |
| `current_position` | JSONB       | Posição atual de leitura |
| `progress_percent` | INTEGER     | Progresso em %           |
| `started_at`       | TIMESTAMPTZ | Início da leitura        |
| `finished_at`      | TIMESTAMPTZ | Término da leitura       |

**Constraints**: UNIQUE(user_id, book_id)
**RLS**: Apenas o próprio usuário

---

#### 6. `user_favorites` - Livros Favoritos

| Coluna             | Tipo        | Descrição              |
| ------------------ | ----------- | ---------------------- |
| `id`               | UUID        | Chave primária         |
| `user_id`          | UUID        | FK para auth.users     |
| `book_id`          | UUID        | ID do livro favoritado |
| `book_title`       | TEXT        | Título do livro        |
| `book_author`      | TEXT        | Autor do livro         |
| `book_cover_color` | TEXT        | Cor da capa            |
| `book_cover_url`   | TEXT        | URL da capa            |
| `book_category`    | TEXT        | Categoria              |
| `created_at`       | TIMESTAMPTZ | Data que favoritou     |

**Constraints**: UNIQUE(user_id, book_id)
**RLS**: Apenas o próprio usuário visualiza/gerencia

---

### Índices de Performance

Diversos índices foram criados para otimizar consultas frequentes:

```sql
-- Books
idx_books_category ON books(category)
idx_books_author ON books(author)
idx_books_rating ON books(rating DESC)

-- User Books
idx_user_books_user_id ON user_books(user_id)
idx_user_books_status ON user_books(status)
idx_user_books_reading_status ON user_books(reading_status)
idx_user_books_category ON user_books(category)

-- Ratings
idx_ratings_book_id ON ratings(book_id)
idx_ratings_user_id ON ratings(user_id)

-- Reading Progress
idx_reading_progress_user_id ON book_reading_progress(user_id)
idx_reading_progress_book_id ON book_reading_progress(book_id)

-- Favorites
idx_user_favorites_user_id ON user_favorites(user_id)
```

---

### Visões (Views)

#### `unified_books_view` (018)

Une books (catálogo) e user_books (criação do usuário) em uma única visão para consultas generalizadas.

---

## ✨ Funcionalidades

### Autenticação

- Login/Registro via Supabase Auth
- Gerenciamento de perfil
- Avatar e bio do usuário

### Descoberta de Livros

- Catálogo público de livros
- Busca por título e autor
- Filtragem por categoria
- Ordenação por rating

### Biblioteca Pessoal

- Livros em andamento
- Livros concluídos
- Todos os livros

### Favoritos

- Adicionar/remover favoritos
- Lista de favoritos do usuário

### Downloads

- Livros para download
- Gestão de downloads

### Editor de Livros

- Criação de novos livros
- Editor de texto rico (Lexical)
- Publicação de livros
- Gestão de status (draft/published)

### Leitor de Livros

- Leitura de livros
- Acompanhamento de progresso
- Marcadores de posição

### Sistema de Avaliação

- Avaliação (1-5 estrelas)
- Reviews textuais

---

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos

- Node.js 18+ ou Bun
- Conta no Supabase (https://supabase.com)

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# (Opcional) Configurações adicionais
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Consulte `.env.example` para todas as variáveis disponíveis.

### 3. Configuração do Banco

Execute as migrações do Supabase:

```bash
# Usando Supabase CLI
supabase db push

# Ou apply manualmente os arquivos em supabase/migrations/
```

### 4. Instalação de Dependências

```bash
# Com Bun (recomendado)
bun install

# Ou npm/yarn/pnpm
npm install
```

### 5. Executando o Projeto

```bash
# Desenvolvimento
bun run dev

# Build de produção
bun run build

# Servidor de produção
bun run start
```

---

## 📜 Scripts Disponíveis

| Script          | Descrição                            |
| --------------- | ------------------------------------ |
| `bun run dev`   | Inicia o servidor de desenvolvimento |
| `bun run build` | Gera build de produção               |
| `bun run start` | Inicia o servidor de produção        |
| `bun run lint`  | Verifica código com ESLint           |

---

## 🎨 Estilos e Design

### Tailwind CSS v4

O projeto utiliza Tailwind CSS v4 com PostCSS para estilização. A configuração está em `postcss.config.mjs`.

### Tipografia

Fontes personalizadas configuradas via Next.js font optimization. consulte `src/app/layout.tsx`.

### Animações

Framer Motion para transições e animações de UI:

- Page transitions
- Modal animations
- Micro-interactions
- Scroll-triggered animations

### Componentes de Design System

O projeto segue um sistema de design com:

- **UI Components**: Botões, inputs, cards puros
- **Widgets**: Componentes compostos com lógica
- **Design Tokens**: Cores, spacing, tipografia

---

## 🤝 Contribuição

### Fluxo de Trabalho

1. **Fork** o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um **Pull Request**

### Convenções de Commit

Seguimos o padrão Conventional Commits:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Estilização
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas diversas

### Padrões de Código

- TypeScript estrito
- ESLint para linting
- Componentes funcionais com React Hooks
- Server Components por padrão
- Separation of Concerns (UI/Widgets/Actions)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lexical](https://lexical.dev)

---

<p align="center">
  Made with ❤️ by <a href="https://ruanvalente-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer"><b>Ruan Valente |&nbsp; Conta.AI Team</b></a> 👋🏽
</p>
