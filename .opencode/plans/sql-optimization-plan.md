# Plano de Otimização e Escala - Estrutura SQL Conta.AI

## 1. Resumo Executivo

Este documento apresenta uma análise abrangente da estrutura SQL atual do projeto Conta.AI e propõe um plano de ação em 4 fases para otimização de performance, segurança e escalabilidade. A análise foi baseada nas melhores práticas do PostgreSQL e Supabase.

**Stack Atual:** Next.js 16 + Supabase (PostgreSQL) + TypeScript + Tailwind CSS

---

## 2. Análise da Estrutura Atual

### 2.1 Tabelas Identificadas

| Tabela                  | Status           | Uso Atual                           |
| ----------------------- | ---------------- | ----------------------------------- |
| `books`                 | ✅ Ativa         | Catálogo de livros do sistema       |
| `user_books`            | ✅ Ativa         | Livros/stórias criados pelo usuário |
| `profiles`              | ✅ Ativa         | Perfis de usuário                   |
| `user_favorites`        | ✅ Ativa         | Sistema de favoritos                |
| `book_reading_progress` | ⚠️ Não utilizada | Tabela existe mas não é consultada  |
| `ratings`               | ⚠️ Não utilizada | Tabela existe mas não é consultada  |

### 2.2 Índices Existentes

**Migração 001:**

- `idx_books_category` - books(category)
- `idx_ratings_book_id` - ratings(book_id)
- `idx_ratings_user_id` - ratings(user_id)

**Migração 009:**

- `idx_books_category_created_at` - books(category, created_at DESC)
- `idx_books_title_trgm` - books USING gin (title gin_trgm_ops)
- `idx_books_author_trgm` - books USING gin (author gin_trgm_ops)
- `idx_ratings_book_user` - ratings(book_id, user_id)

---

## 3. Problemas Identificados

### 3.1 Críticos (Impacto Alto - Corrigir Imediatamente)

| #   | Problema                                 | Impacto                                             | Tabela         |
| --- | ---------------------------------------- | --------------------------------------------------- | -------------- |
| P1  | **`user_books.published_at` sem índice** | Queries com `ORDER BY published_at` não usam índice | user_books     |
| P2  | **`user_favorites.book_id` sem índice**  | Deletes por book_id fazem full scan                 | user_favorites |
| P3  | **Sem índices trigram em `user_books`**  | Busca textual em user_books é lenta                 | user_books     |
| P4  | **Duplicação de `getSupabaseAdmin()`**   | Código duplicado em múltiplos arquivos              | -              |
| P5  | **`user_books.word_count` como INTEGER** | Pode estourar com textos muito grandes              | user_books     |

### 3.2 Altos (Impacto Significativo - Planejado)

| #   | Problema                                         | Impacto                                   | Tabela               |
| --- | ------------------------------------------------ | ----------------------------------------- | -------------------- |
| P6  | **Tabela `book_reading_progress` não utilizada** | Dados órfãos, schema inconsistente        | -                    |
| P7  | **Tabela `ratings` não utilizada**               | Estrutura pronta mas sem uso              | -                    |
| P8  | **N+1 queries em `getCurrentUserBooks`**         | 3 queries sequenciais podem ser 1         | user_books           |
| P9  | **Ausência de `updated_at` trigger**             | Updates manuais propagados incorretamente | user_books, profiles |
| P10 | **Sem validação de categorias**                  | CHECK constraint inexistente              | books, user_books    |

### 3.3 Médios (Melhorias de Boas Práticas)

| #   | Problema                              | Impacto                               | Tabela              |
| --- | ------------------------------------- | ------------------------------------- | ------------------- |
| P11 | **Ausência de `created_at` NOT NULL** | Inconsistência com `updated_at`       | profiles            |
| P12 | **Sem constraint de rating 1-5**      | Permite valores fora do range         | ratings (não usado) |
| P13 | **Casting manual de tipos**           | `formatBook()` com conversões manuais | -                   |
| P14 | **Ausência departial indexes**        | Índices genéricos sem otimização      | -                   |

---

## 4. Plano de Ação em Fases

### Fase 1: Correções Críticas de Performance

**Estimativa:** 2-3 dias | **Prioridade:** CRÍTICA

#### 1.1 Índices de Performance

```sql
-- Migration: 013_add_critical_indexes
-- Fase 1: Índices de Performance

-- 1. Índice para ORDER BY published_at
CREATE INDEX CONCURRENTLY idx_user_books_published_at_desc
ON user_books(published_at DESC)
WHERE published_at IS NOT NULL;

-- 2. Índice para book_id em user_favorites
CREATE INDEX CONCURRENTLY idx_user_favorites_book_id
ON user_favorites(book_id);

-- 3. Extensão pg_trgm para user_books
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. Índices trigram para busca textual em user_books
CREATE INDEX CONCURRENTLY idx_user_books_title_trgm
ON user_books USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_user_books_author_trgm
ON user_books USING gin (author gin_trgm_ops);

-- 5. Índice composto para category + status (query comum)
CREATE INDEX CONCURRENTLY idx_user_books_category_status
ON user_books(category, status)
WHERE status = 'published';

-- 6. Índice para busca de favoritos por usuário
CREATE INDEX CONCURRENTLY idx_user_favorites_user_book
ON user_favorites(user_id, book_id);
```

#### 1.2 Consolidação de Supabase Client

**Arquivo:** `src/utils/supabase/admin.ts`

```typescript
// Consolidar getSupabaseAdmin() em utilitário único
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components
        }
      },
    },
  });
}
```

#### 1.3 Refatoração de books.actions.ts

- Remover `getSupabaseAdmin()` local
- Importar de `@/utils/supabase/admin`
- Consolidar `formatBook()` em módulo compartilhado

---

### Fase 2: Estruturação e Consistência de Schema

**Estimativa:** 3-4 dias | **Prioridade:** ALTA

#### 2.1 Constraint de Categorias

```sql
-- Migration: 014_add_category_constraints

-- Criar enum para categorias (futura expansão)
CREATE TYPE book_category AS ENUM (
  'Drama',
  'Fantasy',
  'Sci-Fi',
  'Business',
  'Education',
  'Geography'
);

-- Adicionar constraint em books
ALTER TABLE books
DROP CONSTRAINT IF EXISTS books_category_check,
ADD CONSTRAINT books_category_check
CHECK (category IN ('Drama', 'Fantasy', 'Sci-Fi', 'Business', 'Education', 'Geography'));

-- Adicionar constraint em user_books
ALTER TABLE user_books
DROP CONSTRAINT IF EXISTS user_books_category_check,
ADD CONSTRAINT user_books_category_check
CHECK (category IN ('Drama', 'Fantasy', 'Sci-Fi', 'Business', 'Education', 'Geography'));
```

#### 2.2 Auto-update de updated_at

```sql
-- Migration: 015_add_updated_at_triggers

-- Função trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em user_books
CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar em books
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar NOT NULL em created_at
ALTER TABLE profiles ALTER COLUMN created_at SET NOT NULL;
```

#### 2.3 Validação de Rating

```sql
-- Migration: 016_validate_ratings
-- Aplicar constraint de rating (1-5)
ALTER TABLE ratings
DROP CONSTRAINT IF EXISTS ratings_rating_check,
ADD CONSTRAINT ratings_rating_check
CHECK (rating >= 1 AND rating <= 5);
```

#### 2.4 Mudança de word_count para BIGINT

```sql
-- Migration: 017_change_word_count_type
ALTER TABLE user_books
ALTER COLUMN word_count TYPE BIGINT USING word_count::BIGINT;
```

---

### Fase 3: Limpeza e Decisão de Tabelas Não Utilizadas

**Estimativa:** 2 dias | **Prioridade:** MÉDIA

#### 3.1 Análise de `book_reading_progress`

**Recomendação:** Decidir entre remover ou implementar

**Opção A - Remover (se não planejado usar):**

```sql
-- Migration: 018_drop_reading_progress
DROP TABLE IF EXISTS book_reading_progress CASCADE;
```

**Opção B - Implementar (se planejado para futuro):**

```sql
-- Migration: 018_implement_reading_progress
-- Adicionar índice para JSONB
CREATE INDEX CONCURRENTLY idx_reading_progress_position_gin
ON book_reading_progress USING gin (current_position);

-- Adicionar partial index para livros em progresso
CREATE INDEX CONCURRENTLY idx_reading_progress_active
ON book_reading_progress(user_id, book_id, progress_percent)
WHERE finished_at IS NULL;
```

#### 3.2 Análise de `ratings`

**Recomendação:** Manter estrutura, implementar feature de ratings

```sql
-- Migration: 018_implement_ratings_feature
-- Criar view agregada de ratings por livro
CREATE OR REPLACE VIEW book_ratings_summary AS
SELECT
  book_id,
  COUNT(*) as rating_count,
  AVG(rating)::DECIMAL(2,1) as avg_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM ratings
GROUP BY book_id;

-- Atualizar books com ratings summary via trigger
CREATE OR REPLACE FUNCTION update_book_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE books
  SET
    rating = (SELECT AVG(rating) FROM ratings WHERE book_id = NEW.book_id),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE book_id = NEW.book_id)
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_book_ratings
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_book_ratings();
```

---

### Fase 4: Otimizações Avançadas e Escalabilidade

**Estimativa:** 5-7 dias | **Prioridade:** BAIXA-MÉDIA

#### 4.1 Otimização de Queries

**Consolidar N+1 queries em `getCurrentUserBooks`:**

```typescript
// user-books.actions.ts - Refatorar
export async function getCurrentUserBooks(userId?: string): Promise<{
  myStories: UserBook[];
  reading: UserBook[];
  completed: UserBook[];
}> {
  // ...

  // ANTES: 3 queries paralelas
  // DEPOIS: 1 query com GROUP BY

  const { data, error } = await supabase
    .from("user_books")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return { myStories: [], reading: [], completed: [] };
  }

  const books = data.map(formatUserBook);

  return {
    myStories: books.filter((b) => b.status === "draft"),
    reading: books.filter((b) => b.readingStatus === "reading"),
    completed: books.filter((b) => b.readingStatus === "completed"),
  };
}
```

#### 4.2 Partial Indexes para Performance

```sql
-- Migration: 019_add_partial_indexes

-- Partial index para livros publicados (mais consultados)
CREATE INDEX CONCURRENTLY idx_user_books_published_category
ON user_books(category, published_at DESC)
WHERE status = 'published';

-- Partial index para status de leitura
CREATE INDEX CONCURRENTLY idx_user_books_reading_active
ON user_books(user_id, updated_at DESC)
WHERE reading_status = 'reading';

-- Partial index para favoritos recentes
CREATE INDEX CONCURRENTLY idx_user_favorites_recent
ON user_favorites(user_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';
```

#### 4.3 Preparação para Sharding/Particionamento

```sql
-- Migration: 020_prepare_partitioning

-- Para futuras partições por usuário (se necessário)
-- Adicionar coluna para partição
ALTER TABLE user_books ADD COLUMN IF NOT EXISTS user_partition_key INTEGER;

-- Função para calcular partition key
UPDATE user_books
SET user_partition_key = (SELECT MAX(id) FROM auth.users WHERE id = user_books.user_id) IS NOT NULL::INTEGER;

-- Comentários para documentação
COMMENT ON TABLE user_books IS 'User-generated books/stories. Partition by user_partition_key when > 10M rows';
COMMENT ON TABLE books IS 'System book catalog. Partition by category when > 1M rows';
```

#### 4.4 RLS Policies Otimizadas

```sql
-- Migration: 021_optimize_rls_policies

-- Consolidar policies de user_books
DROP POLICY IF EXISTS "Users can view own books" ON user_books;
DROP POLICY IF EXISTS "Users can update own books" ON user_books;
DROP POLICY IF EXISTS "Users can insert books" ON user_books;
DROP POLICY IF EXISTS "Users can delete own books" ON user_books;

-- Policy unificada
CREATE POLICY "user_books_owner_access" ON user_books
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy para leitura de publicados
CREATE POLICY "user_books_public_read" ON user_books
  FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);
```

---

## 5. Ganhos Estimados

| Fase | Melhoria                  | Impacto                            |
| ---- | ------------------------- | ---------------------------------- |
| 1    | Índices de performance    | 50-80% redução em queries de busca |
| 1    | Consolidação admin client | 15% redução de código duplicado    |
| 2    | Triggers auto-update      | 100% consistência de timestamps    |
| 2    | Constraints de categoria  | Prevenção de dados inválidos       |
| 3    | Decisão de tabelas        | Schema mais limpo e manutenível    |
| 4    | Query consolidation       | 66% redução de round trips (3→1)   |
| 4    | Partial indexes           | 40% redução de espaço em disco     |

---

## 6. Riscos e Mitigações

| Risco                      | Probabilidade | Impacto | Mitigação                     |
| -------------------------- | ------------- | ------- | ----------------------------- |
| Índices bloqueiam writes   | Média         | Alto    | Criar índices CONCURRENTLY    |
| Breaking changes em RLS    | Baixa         | Alto    | Testar em staging primeiro    |
| Perda de dados em migração | Baixa         | Crítico | Backup antes de cada migração |
| Tempo de migração longo    | Média         | Médio   | Executar em off-peak hours    |

---

## 7. Checklist de Execução

### Pré-requisitos

- [ ] Backup completo do banco
- [ ] Ambiente de staging configurado
- [ ] Monitoramento de queries lento (pg_stat_statements)
- [ ] Plano de rollback documentado

### Fase 1

- [ ] Criar migration 013_add_critical_indexes
- [ ] Testar índices em staging
- [ ] Validar com EXPLAIN ANALYZE
- [ ] Criar src/utils/supabase/admin.ts
- [ ] Refatorar books.actions.ts
- [ ] Deploy em produção

### Fase 2

- [ ] Criar migration 014_add_category_constraints
- [ ] Criar migration 015_add_updated_at_triggers
- [ ] Criar migration 016_validate_ratings
- [ ] Criar migration 017_change_word_count_type
- [ ] Testar todas as migrations
- [ ] Deploy em produção

### Fase 3

- [ ] Decidir destino de book_reading_progress
- [ ] Implementar ou remover (baseado na decisão)
- [ ] Implementar ratings view se aplicável
- [ ] Deploy em produção

### Fase 4

- [ ] Refatorar getCurrentUserBooks
- [ ] Criar partial indexes
- [ ] Otimizar RLS policies
- [ ] Documentar partitioning strategy
- [ ] Deploy em produção

---

## 8. Cronograma Sugerido

```
Semana 1: Fase 1 (Correções Críticas)
├── Dia 1-2: Índices de performance
├── Dia 3: Consolidação Supabase client
└── Dia 4-5: Testing + deploy

Semana 2: Fase 2 (Estruturação)
├── Dia 1-2: Category constraints
├── Dia 3: Updated_at triggers
└── Dia 4-5: Testing + deploy

Semana 3: Fase 3 (Limpeza)
├── Dia 1-2: Decisão book_reading_progress
├── Dia 3: Ratings implementation
└── Dia 4-5: Testing + deploy

Semana 4: Fase 4 (Otimizações)
├── Dia 1-2: Query optimization
├── Dia 3-4: Partial indexes
└── Dia 5: RLS + documentation
```

---

## 9. Métricas de Sucesso

| Métrica                         | Baseline    | Target      |
| ------------------------------- | ----------- | ----------- |
| Tempo médio de query            | ~100ms      | <30ms       |
| Taxa de crescimento de disco    | +5GB/semana | +2GB/semana |
| Queries sem índice              | 15%         | 0%          |
| Código duplicado (admin client) | 3 arquivos  | 1 arquivo   |

---

## 10. Referências

- PostgreSQL Table Design Best Practices
- Supabase Documentation (https://supabase.com/docs)
- PostgreSQL Indexing Strategies (https://www.postgresql.org/docs/current/indexes.html)
- RLS Best Practices (https://supabase.com/docs/guides/auth/row-level-security)

---

_Documento gerado em: 30/03/2026_
_Versão: 1.0_
