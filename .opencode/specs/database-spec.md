# Database Specification

## Description

Este documento define a especificação do banco de dados PostgreSQL (Supabase) para a aplicação Conta.AI, incluindo schema, tabelas, índices, funções, triggers, views, constraints, RLS policies e storage.

**Baseado no schema consolidado:** `supabase/migrations/000_initial_schema.sql`

---

## Sumário

- [1. Extensions](#1-extensions)
- [2. Tabelas](#2-tabelas)
  - [2.1. profiles](#21-profiles)
  - [2.2. books](#22-books)
  - [2.3. user_books](#23-user_books)
  - [2.4. ratings](#24-ratings)
  - [2.5. user_favorites](#25-user_favorites)
  - [2.6. author_follow](#26-author_follow)
  - [2.7. book_reading_progress](#27-book_reading_progress)
- [3. Unique Constraints (parciais)](#3-unique-constraints-parciais)
- [4. Funções](#4-funções)
- [5. Triggers](#5-triggers)
- [6. Views](#6-views)
- [7. Índices de Performance](#7-índices-de-performance)
- [8. Row-Level Security (RLS)](#8-row-level-security-rls)
- [9. Storage](#9-storage)
- [10. Seed Data](#10-seed-data)
- [Boas Práticas Aplicadas](#boas-práticas-aplicadas)
- [Migration Pattern](#migration-pattern)
- [Acceptance Criteria](#acceptance-criteria)

---

## 1. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

- **pg_trgm**: Fornece suporte a trigramas para busca textual (usado em índices GIN de `books.title`, `books.author`, `books.description`).

---

## 2. Tabelas

### 2.1. profiles

Estende `auth.users` com informações de perfil.

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário (mesmo do auth) |
| name | TEXT | NULL | Nome do usuário |
| avatar_url | TEXT | NULL | URL do avatar |
| bio | TEXT | NULL | Biografia |
| role | TEXT | DEFAULT 'reader' CHECK (role IN ('reader', 'author')) | Papel do usuário |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

#### Observações

- A FK `id → auth.users(id)` garante que só existam profiles para usuários autenticados.
- O campo `role` é atualizado automaticamente pelos triggers `auto_update_author_role` e `auto_downgrade_author_role` quando um usuário publica ou remove livros.

---

### 2.2. books

Catálogo público de livros (seeded pela aplicação).

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| title | TEXT | NOT NULL | Título |
| author | TEXT | NOT NULL | Autor |
| cover_url | TEXT | NULL | URL da capa |
| cover_color | TEXT | DEFAULT '#8B4513' | Cor de fundo da capa |
| description | TEXT | NULL | Descrição |
| category | TEXT | NOT NULL | Categoria (Sci-Fi, Fantasy, Drama, Business, Education, Geography) |
| pages | INTEGER | DEFAULT 0 | Número de páginas |
| rating | DECIMAL(3,2) | DEFAULT 0 | Avaliação média |
| rating_count | INTEGER | DEFAULT 0 | Nº de avaliações |
| review_count | INTEGER | DEFAULT 0 | Nº de resenhas |
| followers_count | INTEGER | DEFAULT 0 | Nº de seguidores (placeholder) |
| favorites_count | INTEGER | DEFAULT 0 | Nº de favoritos |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

#### Observações

- `followers_count` é calculado automaticamente via trigger `trg_author_follow_followers_count` em `author_follow`. O cálculo conta quantos usuários seguem o autor do livro (match por `books.author = author_follow.author_name`). Ou seja, `followers_count` de um livro = número de seguidores do autor daquele livro.
- `favorites_count` é atualizado automaticamente pelo trigger `trg_user_favorites_stats` em `user_favorites`.

---

### 2.3. user_books

Livros criados por usuários (histórias originais).

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | ID do criador |
| title | TEXT | NOT NULL | Título |
| author | TEXT | NOT NULL | Autor |
| cover_url | TEXT | NULL | URL da capa |
| cover_color | TEXT | DEFAULT '#8B4513' | Cor de fundo da capa |
| content | TEXT | NULL | Conteúdo do livro |
| content_url | TEXT | NULL | URL do conteúdo |
| status | TEXT | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')) | Status de publicação |
| reading_status | TEXT | DEFAULT 'none' CHECK (reading_status IN ('none', 'reading', 'completed')) | Status de leitura |
| reading_progress | INTEGER | DEFAULT 0 | Progresso (0-100) |
| category | TEXT | NOT NULL | Categoria |
| word_count | INTEGER | DEFAULT 0 | Contagem de palavras |
| rating | DECIMAL(3,2) | DEFAULT 0 | Avaliação média |
| rating_count | INTEGER | DEFAULT 0 | Nº de avaliações |
| followers_count | INTEGER | DEFAULT 0 | Nº de seguidores (placeholder) |
| favorites_count | INTEGER | DEFAULT 0 | Nº de favoritos |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de atualização |
| published_at | TIMESTAMPTZ | NULL | Data de publicação |

#### Observações

- O trigger `auto_update_author_role` promove o `profile.role` para 'author' quando um `user_book` é publicado.
- O trigger `auto_downgrade_author_role` reverte para 'reader' quando não há mais livros publicados.
- A view `unified_books` expõe apenas registros com `status = 'published'`.

---

### 2.4. ratings

Avaliações de livros (suporta usuários autenticados e anônimos via `session_id`).

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| book_id | UUID | NOT NULL | ID do livro (books OU user_books) |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário (NULL para anônimo) |
| rating | INTEGER | NOT NULL CHECK (rating >= 1 AND rating <= 5) | Avaliação (1-5) |
| review | TEXT | NULL | Resenha textual |
| session_id | TEXT | NULL | ID de sessão anônima |
| rated_by_type | TEXT | DEFAULT 'user' | Tipo de avaliador |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

#### Observações

- **Não possui FK para `books` ou `user_books`** porque pode referenciar ambas as tabelas.
- A validação de `book_id` é feita via trigger `trg_validate_rating_book_id` que verifica existência em `books` OU `user_books`.
- Usuários anônimos são identificados por `session_id` (sem `user_id`).
- Unique constraints parciais garantem avaliação única por (book_id, user_id) ou (book_id, session_id).

---

### 2.5. user_favorites

Livros favoritados pelos usuários. Os metadados do livro (título, autor, capa, categoria) são obtidos via JOIN com a view `unified_books`.

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário (NULL para anônimo) |
| book_id | UUID | NOT NULL | ID do livro |
| session_id | TEXT | NULL | ID de sessão anônima |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de criação |

#### Histórico

- **Antes da migration 042:** Continha colunas de cache desnormalizado (`book_title`, `book_author`, `book_cover_color`, `book_cover_url`, `book_category`) para evitar JOINs.
- **Migration 042:** Removeu as colunas de cache. Os metadados agora são obtidos via `unified_books` view no repositório (`SupabaseFavoriteRepository.getByUser` faz JOIN batch).
- O trigger `trg_user_favorites_stats` atualiza `favorites_count` em `books`/`user_books`.

---

### 2.6. author_follow

Seguidores de autores (baseado em nome do autor, não UUID).

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário (NULL para anônimo) |
| author_name | TEXT | NOT NULL | Nome do autor seguido |
| session_id | TEXT | NULL | ID de sessão anônima |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

#### Observações

- O modelo usa `author_name TEXT` (não FK para uma tabela `authors`), porque livros usam `author TEXT` diretamente.
- As tabelas `authors` e `author_books` (criadas em migrations antigas) foram removidas — não são necessárias.

---

### 2.7. book_reading_progress

Progresso de leitura de livros (suporta books do catálogo E user_books).

#### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário |
| book_id | UUID | NOT NULL | ID do livro (books OU user_books) |
| current_position | JSONB | DEFAULT '{}' | Posição atual de leitura |
| progress_percent | INTEGER | DEFAULT 0 | Progresso percentual (0-100) |
| started_at | TIMESTAMPTZ | DEFAULT NOW() | Data de início |
| finished_at | TIMESTAMPTZ | NULL | Data de conclusão |

#### Observações

- **Não possui FK para `books` ou `user_books`** — a validação é feita via trigger `trg_validate_reading_progress_book_id`.

---

## 3. Unique Constraints (parciais)

Usamos partial unique indexes para suportar tanto usuários autenticados (via `user_id`) quanto anônimos (via `session_id`):

| Tabela | Index Name | Unique On | Condição |
|--------|-----------|-----------|----------|
| ratings | `idx_ratings_user_book` | (book_id, user_id) | WHERE user_id IS NOT NULL |
| ratings | `idx_ratings_session_book` | (book_id, session_id) | WHERE session_id IS NOT NULL |
| user_favorites | `idx_user_favorites_user_book` | (user_id, book_id) | WHERE user_id IS NOT NULL |
| user_favorites | `idx_user_favorites_session_book` | (session_id, book_id) | WHERE session_id IS NOT NULL |
| author_follow | `idx_author_follow_user_author` | (user_id, author_name) | WHERE user_id IS NOT NULL |
| author_follow | `idx_author_follow_session_author` | (session_id, author_name) | WHERE session_id IS NOT NULL |
| book_reading_progress | `idx_reading_progress_user_book` | (user_id, book_id) | *(full unique, no WHERE)* |

---

## 4. Funções

Total: **13 funções**

### 4.1. `handle_new_user()`
- **Tipo:** Trigger function (SECURITY DEFINER)
- **Propósito:** Cria automaticamente um profile quando um novo usuário se registra no `auth.users`.
- **Disparo:** `on_auth_user_created` (AFTER INSERT ON auth.users)

### 4.2. `update_updated_at_column()`
- **Tipo:** Trigger function
- **Propósito:** Atualiza a coluna `updated_at` para o timestamp atual em operações UPDATE.

### 4.3. `update_book_rating()`
- **Tipo:** Trigger function (SECURITY DEFINER) — **Otimizada**
- **Propósito:** Recalcula o rating médio e contagem após INSERT/UPDATE/DELETE em `ratings`.
- **Otimização:** Atualiza APENAS a tabela onde o livro existe (`books` ou `user_books`), não ambas.
- **Disparo:** `update_book_rating_trigger` (AFTER INSERT OR UPDATE OR DELETE ON ratings)

### 4.4. `update_book_stats_on_favorite()`
- **Tipo:** Trigger function
- **Propósito:** Incrementa/decrementa `favorites_count` em `books` e `user_books` conforme INSERT/DELETE em `user_favorites`.

### 4.5. `auto_update_author_role()`
- **Tipo:** Trigger function
- **Propósito:** Promove `profile.role` para 'author' quando um `user_book` é publicado.

### 4.6. `auto_downgrade_author_role()`
- **Tipo:** Trigger function
- **Propósito:** Reverte `profile.role` para 'reader' quando um usuário não tem mais livros publicados.

### 4.7. `validate_book_id()`
- **Tipo:** Trigger function
- **Propósito:** Valida que `book_id` existe em `books` OU `user_books`. Usada nas tabelas `ratings` e `book_reading_progress` que não têm FK tradicional.

### 4.8. `recalculate_book_stats()`
- **Tipo:** Regular function
- **Propósito:** Recalcula todas as estatísticas (rating, rating_count, favorites_count) para todos os livros. Função de manutenção.

### 4.9. `migrate_session_follows(p_session_id TEXT, p_user_id UUID)`
- **Tipo:** Regular function (SECURITY DEFINER) → RETURNS INTEGER
- **Propósito:** Migra follows anônimos para um usuário recém-autenticado.

### 4.10. `migrate_session_ratings(p_session_id TEXT, p_user_id UUID)`
- **Tipo:** Regular function (SECURITY DEFINER) → RETURNS INTEGER
- **Propósito:** Migra ratings anônimos para um usuário recém-autenticado.

### 4.11. `migrate_session_favorites(p_session_id TEXT, p_user_id UUID)`
- **Tipo:** Regular function (SECURITY DEFINER) → RETURNS INTEGER
- **Propósito:** Migra favorites anônimos para um usuário recém-autenticado.

### 4.12. `recalculate_author_followers_count(p_author_name TEXT)`
- **Tipo:** Regular function (SECURITY DEFINER) → RETURNS void
- **Propósito:** Recalcula `followers_count` para todos os `books` e `user_books` de um determinado autor, contando quantos usuários o seguem em `author_follow`.
- **Adicionada na:** Migration 043

### 4.13. `update_followers_count_on_follow_change()`
- **Tipo:** Trigger function (SECURITY DEFINER)
- **Propósito:** Mantém `followers_count` sincronizado em `books` e `user_books` quando um follow é adicionado ou removido em `author_follow`.
- **Disparo:** `trg_author_follow_followers_count` (AFTER INSERT OR DELETE ON author_follow)

---

## 5. Triggers

Total: **10 triggers**

| Trigger | Tabela | Evento | Função |
|---------|--------|--------|--------|
| `on_auth_user_created` | auth.users | AFTER INSERT | `handle_new_user()` |
| `update_profiles_updated_at` | profiles | BEFORE UPDATE | `update_updated_at_column()` |
| `update_user_books_updated_at` | user_books | BEFORE UPDATE | `update_updated_at_column()` |
| `update_book_rating_trigger` | ratings | AFTER INSERT OR UPDATE OR DELETE | `update_book_rating()` |
| `trg_user_favorites_stats` | user_favorites | AFTER INSERT OR DELETE | `update_book_stats_on_favorite()` |
| `trg_auto_update_author_role` | user_books | AFTER INSERT OR UPDATE OF status (WHEN NEW.status = 'published') | `auto_update_author_role()` |
| `trg_auto_downgrade_author_role` | user_books | AFTER UPDATE OF status OR DELETE (WHEN OLD.status = 'published') | `auto_downgrade_author_role()` |
| `trg_validate_rating_book_id` | ratings | BEFORE INSERT OR UPDATE | `validate_book_id()` |
| `trg_validate_reading_progress_book_id` | book_reading_progress | BEFORE INSERT OR UPDATE | `validate_book_id()` |
| `trg_author_follow_followers_count` | author_follow | AFTER INSERT OR DELETE | `update_followers_count_on_follow_change()` |

---

## 6. Views

### 6.1. unified_books

View unificada que combina livros do catálogo (`books`) com livros criados por usuários (`user_books`).

```sql
CREATE OR REPLACE VIEW unified_books AS
SELECT
  'catalog'::TEXT AS source,
  id, title, author, cover_url, cover_color,
  description, category,
  pages AS page_count,
  rating, rating_count, review_count,
  followers_count, favorites_count,
  created_at,
  NULL::UUID AS user_id,
  NULL::TEXT AS author_name,
  NULL::TEXT AS status,
  NULL::INT AS word_count,
  NULL::TIMESTAMPTZ AS published_at
FROM books
UNION ALL
SELECT
  'user'::TEXT AS source,
  ub.id, ub.title, ub.author, ub.cover_url, ub.cover_color,
  NULL::TEXT AS description, ub.category,
  CEIL(ub.word_count / 500)::INT AS page_count,
  ub.rating, ub.rating_count, 0 AS review_count,
  ub.followers_count, ub.favorites_count,
  ub.created_at, ub.user_id,
  p.name AS author_name,
  ub.status, ub.word_count, ub.published_at
FROM user_books ub
LEFT JOIN profiles p ON ub.user_id = p.id
WHERE ub.status = 'published';
```

- `source` = 'catalog' (livros do seed) ou 'user' (criados por usuários)
- Grants: SELECT para `authenticated` e `anon`

---

## 7. Índices de Performance

Total: **~43 índices** (incluindo unique constraints parciais)

### 7.1. books (9 índices)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_books_category` | category | btree |
| `idx_books_rating_count` | rating DESC, rating_count DESC | WHERE rating > 0 |
| `idx_books_category_rating` | category, rating DESC | WHERE rating > 0 |
| `idx_books_category_created` | category, created_at DESC | btree |
| `idx_books_title_search` | title | gin (gin_trgm_ops) |
| `idx_books_author_search` | author | gin (gin_trgm_ops) |
| `idx_books_description_trgm` | description | gin (gin_trgm_ops), WHERE description IS NOT NULL |
| `idx_books_followers_count` | followers_count DESC | btree |
| `idx_books_favorites_count` | favorites_count DESC | btree |

### 7.2. user_books (12 índices)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_user_books_user_id` | user_id | btree |
| `idx_user_books_status` | status | btree |
| `idx_user_books_reading_status` | reading_status | btree |
| `idx_user_books_category` | category | btree |
| `idx_user_books_user_status` | user_id, status | btree |
| `idx_user_books_user_reading` | user_id, reading_status | btree |
| `idx_user_books_user_published` | user_id, published_at DESC NULLS LAST | WHERE published_at IS NOT NULL |
| `idx_user_books_status_published` | status, published_at DESC | WHERE status = 'published' |
| `idx_user_books_user_category` | user_id, category | WHERE status = 'published' |
| `idx_user_books_user_reading_status` | user_id, reading_status, updated_at DESC | WHERE reading_status != 'none' |
| `idx_user_books_followers_count` | followers_count DESC | btree |
| `idx_user_books_favorites_count` | favorites_count DESC | btree |
| `idx_user_books_author_lookup` | LOWER(author) | WHERE status = 'published' |

### 7.3. ratings (5 + 2 partial unique = 7)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_ratings_book_id` | book_id | btree |
| `idx_ratings_user_id` | user_id | btree |
| `idx_ratings_book_rating` | book_id, rating | WHERE book_id IS NOT NULL |
| `idx_ratings_user_created` | user_id, created_at DESC | WHERE user_id IS NOT NULL |
| `idx_ratings_session_id` | session_id | WHERE session_id IS NOT NULL |
| `idx_ratings_user_book` | (book_id, user_id) UNIQUE | WHERE user_id IS NOT NULL |
| `idx_ratings_session_book` | (book_id, session_id) UNIQUE | WHERE session_id IS NOT NULL |

### 7.4. user_favorites (4 + 2 partial unique = 6)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_user_favorites_user_id` | user_id | btree |
| `idx_user_favorites_book` | book_id | btree |
| `idx_user_favorites_created` | user_id, created_at DESC | btree |
| `idx_user_favorites_session_lookup` | session_id | WHERE user_id IS NULL |
| `idx_user_favorites_user_book` | (user_id, book_id) UNIQUE | WHERE user_id IS NOT NULL |
| `idx_user_favorites_session_book` | (session_id, book_id) UNIQUE | WHERE session_id IS NOT NULL |

### 7.5. author_follow (3 + 2 partial unique = 5)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_author_follow_user` | user_id | btree |
| `idx_author_follow_author_name` | author_name | btree |
| `idx_author_follow_session_lookup` | session_id | WHERE user_id IS NULL |
| `idx_author_follow_user_author` | (user_id, author_name) UNIQUE | WHERE user_id IS NOT NULL |
| `idx_author_follow_session_author` | (session_id, author_name) UNIQUE | WHERE session_id IS NOT NULL |

### 7.6. book_reading_progress (2 + 1 unique = 3)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_reading_progress_user_id` | user_id | btree |
| `idx_reading_progress_book_id` | book_id | btree |
| `idx_reading_progress_user_book` | (user_id, book_id) UNIQUE | btree |

### 7.7. profiles (2 índices)

| Nome | Coluna(s) | Tipo/Filtro |
|------|-----------|-------------|
| `idx_profiles_name_lookup` | LOWER(name) | btree |
| `idx_profiles_role` | role | WHERE role IS NOT NULL |

---

## 8. Row-Level Security (RLS)

Todas as tabelas têm RLS habilitado. Policies consolidadas (sem sobreposição).

### 8.1. profiles

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Profiles are publicly readable" | SELECT | TO public USING (true) |
| "Users can insert own profile" | INSERT | WITH CHECK (auth.uid() = id) |
| "Users can update own profile" | UPDATE | USING (auth.uid() = id) |

### 8.2. books

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Books are publicly readable" | SELECT | TO public USING (true) |
| "Authenticated users can insert books" | INSERT | WITH CHECK (auth.role() = 'authenticated') |

### 8.3. user_books

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Published books are publicly readable" | SELECT | TO public USING (status = 'published') |
| "Users manage own books" | ALL | USING (auth.uid() = user_id) |

### 8.4. ratings

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Ratings are publicly readable" | SELECT | TO public USING (true) |
| "Authenticated users can insert ratings" | INSERT | WITH CHECK (auth.uid() = user_id) |
| "Anonymous users can insert ratings" | INSERT | WITH CHECK (user_id IS NULL AND session_id IS NOT NULL) |
| "Users can update own ratings" | UPDATE | USING (auth.uid() = user_id) |
| "Anonymous can update own ratings" | UPDATE | USING (user_id IS NULL AND session_id IS NOT NULL) |
| "Users can delete own ratings" | DELETE | USING (auth.uid() = user_id) |

### 8.5. user_favorites

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Users can view own favorites" | SELECT | USING (auth.uid() = user_id OR user_id IS NULL) |
| "Users can insert favorites" | INSERT | WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL)) |
| "Users can delete own favorites" | DELETE | USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL)) |

### 8.6. author_follow

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Author follows are publicly readable" | SELECT | TO public USING (true) |
| "Users can insert follows" | INSERT | WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL)) |
| "Users can delete own follows" | DELETE | USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL)) |

### 8.7. book_reading_progress

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Users manage own reading progress" | ALL | USING (auth.uid() = user_id) |

---

## 9. Storage

### Bucket: `contaai`

- **Tipo:** Público
- **File size limit:** 2 MB (2097152 bytes)
- **MIME types permitidos:** image/jpeg, image/png, image/webp

### Policies do Storage

| Policy | Operação | Acesso |
|--------|----------|--------|
| "Public read contaai" | SELECT | USING (bucket_id = 'contaai') |
| "Users can upload to contaai" | INSERT | WITH CHECK (bucket_id = 'contaai' AND auth.uid() = owner) |
| "Users can manage own files in contaai" | ALL | USING (bucket_id = 'contaai' AND auth.uid() = owner) |

---

## 10. Seed Data

O schema consolidado inclui **12 livros** no catálogo inicial:

| Título | Autor | Categoria |
|--------|-------|-----------|
| O Último Suspiro | Maria Silva | Drama |
| Noites de Luar | João Pedro | Fantasy |
| Fragmentos do Amanhã | Ana Clara | Sci-Fi |
| O Caminho do Sucesso | Ricardo Borges | Business |
| Travessias | Carla Mendes | Drama |
| Além das Estrelas | Pedro Henrique | Sci-Fi |
| O Reino Encantado | Fernanda Costa | Fantasy |
| Geografia Global | Marcos Oliveira | Geography |
| Métodos de Aprendizagem | Juliana Santos | Education |
| A Arte da Negociação | Roberto Almeida | Business |
| Mundos Paralelos | Lucas Ferreira | Sci-Fi |
| Lendas do Norte | Sofia Rodrigues | Fantasy |

---

## Boas Práticas Aplicadas

### 1. Tipos de Dados

- ✅ UUID para IDs com `gen_random_uuid()`
- ✅ TIMESTAMPTZ para timestamps (não usar TIMESTAMP)
- ✅ TEXT para strings (não usar VARCHAR)
- ✅ DECIMAL(3,2) para valores decimais de rating
- ✅ JSONB para dados semi-estruturados (`current_position` em book_reading_progress)
- ✅ CHECK constraints para valores enumerados (status, role, rating, reading_status)

### 2. Índices

- ✅ Índices GIN com `pg_trgm` para busca textual (title, author, description)
- ✅ Índices parciais (WHERE) para reduzir tamanho e overhead
- ✅ Índices compostos para queries com múltiplos filtros
- ✅ Índices funcionais (`LOWER(author)`) para busca case-insensitive
- ✅ Partial unique indexes para suporte anonymous
- ✅ Sem índices duplicados (consolidado)

### 3. Performance

- ✅ Trigger de rating otimizado — atualiza apenas a tabela correta (books OU user_books)
- ✅ FKs substituídas por triggers de validação onde necessário (ratings, book_reading_progress)
- ✅ View unificada para queries de books + user_books
- ✅ Trigger de followers_count mantém books/user_books sincronizados com author_follow
- ✅ user_favorites normalizado (sem cache desnormalizado)

### 4. RLS

- ✅ Row-Level Security habilitado em todas as tabelas
- ✅ Políticas específicas para cada operação (SELECT, INSERT, UPDATE, DELETE)
- ✅ Suporte a usuários autenticados e anônimos (session_id)
- ✅ Políticas consolidadas (sem sobreposição de múltiplas migrations)

### 5. Constraints

- ✅ CHECK constraints para valores enumerados
- ✅ NOT NULL onde semanticamente necessário
- ✅ Defaults para valores comuns
- ✅ Unique constraints parciais para anonymous support
- ✅ Triggers de validação substituem FKs onde necessário

---

## Migration Pattern

### Criar nova migration incremental

```sql
-- NUMERO_descricao.sql em supabase/migrations/
-- Exemplo: 042_add_new_feature.sql

-- Usar IF NOT EXISTS / OR REPLACE para ser idempotente
CREATE TABLE IF NOT EXISTS new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_new_feature_name ON new_feature(name);

-- RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "new_feature_select" ON new_feature;
CREATE POLICY "new_feature_select" ON new_feature FOR SELECT USING (true);
```

### Reset completo (apenas desenvolvimento)

```sql
-- 1. Executar supabase/migrations/drop_all.sql
-- 2. Executar supabase/migrations/000_initial_schema.sql
-- 3. Executar supabase/migrations/verify_schema.sql
```

---

## Acceptance Criteria

- [x] Todas as tabelas têm PRIMARY KEY
- [x] Todas as tabelas com dados sensíveis têm RLS habilitado
- [x] Foreign keys têm índices para performance
- [x] Constraints CHECK para valores enumerados
- [x] Triggers para created_at/updated_at automáticos
- [x] Migration naming convention segue padrão NUMERO_descricao.sql
- [x] Nenhuma tabela órfã no schema public (sem authors/author_books)
- [x] Nenhum índice duplicado
- [x] Trigger de rating atualiza apenas a tabela correta
- [x] ratings.book_id validado contra books e user_books (trigger)
- [x] book_reading_progress aceita books de qualquer fonte (trigger)
- [x] View unified_books inclui followers_count e favorites_count
- [x] Políticas RLS consolidadas e documentadas (neste documento)
- [x] Partial unique indexes para suporte anonymous
- [x] Funções de migração de sessão (anonymous → authenticated)
- [x] user_favorites sem cache desnormalizado (migration 042)
- [x] followers_count mantido por trigger a partir de author_follow (migration 043)
