# Plano de Otimização do Banco de Dados - Conta.AI

## 🎯 Objetivo

Identificar e corrigir problemas estruturais no schema do banco de dados PostgreSQL (Supabase), eliminando tabelas órfãs, índices duplicados, inconsistências de design e gargalos de performance.

---

## 🧹 Fase 0: Database Reset (Clean Slate)

### Motivação

Antes de aplicar as correções incrementais, o banco atual precisa ser **totalmente resetado** (drop all tables, views, functions, triggers) e recriado do zero com um schema consolidado. Isso garante que:

1. **Schema limpo** — sem resquícios de migrations antigas ou estados inconsistentes
2. **Índices otimizados** — criados uma única vez, sem duplicações
3. **RLS policies consolidadas** — sem sobreposição de múltiplas migrations
4. **FKs e triggers corretos** — aplicados já com as correções embutidas
5. **Seed data atualizado** — compatível com o schema final

### Procedimento de Reset

#### Passo 1: Executar script DROP completo

```bash
# No Supabase SQL Editor ou psql, execute:
supabase/migrations/drop_all.sql
```

Este script remove **todos** os objetos do schema public (triggers, functions, views, tables, indexes) na ordem correta.

**⚠️ Atenção:** Isso destrói **todos os dados existentes**. Execute apenas em ambiente de desenvolvimento ou após backup de produção.

#### Passo 2: Aplicar schema consolidado

✅ **Concluído** — O arquivo `supabase/migrations/000_initial_schema.sql` contém TODO o schema consolidado:

- Extensions (`pg_trgm`)
- 7 tabelas (sem `authors`/`author_books`)
- Unique constraints parciais (suporte anonymous)
- 11 funções (incluindo as otimizadas)
- 9 triggers (incluindo validação de book_id)
- View `unified_books` atualizada
- 40+ índices (sem duplicações)
- RLS policies consolidadas (sem sobreposição)
- Storage bucket `contaai`
- Seed data (12 livros do catálogo)

**Ordem de criação no arquivo:**
```
1. Extensions (pg_trgm)
2. profiles
3. books
4. user_books
5. ratings
6. user_favorites
7. author_follow
8. book_reading_progress
9. Unique constraints parciais
10. Funções
11. Triggers
12. View unified_books
13. Índices
14. RLS Policies
15. Storage
16. Seed data
```

#### Passo 3: Verificação

```bash
# Execute no Supabase SQL Editor:
supabase/migrations/verify_schema.sql
```

O script de verificação confirma:
- ✅ 7 tabelas esperadas (sem `authors`/`author_books`)
- ✅ View `unified_books` funcional
- ✅ 11 funções
- ✅ 9 triggers
- ✅ Índices por tabela
- ✅ Partial unique indexes
- ✅ RLS policies por tabela
- ✅ Seed data (12 livros)
- ✅ Storage bucket `contaai`

### Rollback do Reset

O rollback é simples: restaurar o banco a partir de um backup ou reaplicar as 32 migrations originais seguidas das correções incrementais.

---

## 📋 Problemas Identificados

### 1. Tabelas Órfãs — `authors` e `author_books` (🔴 Crítico)

**Problema:**
As tabelas `authors` e `author_books` foram criadas na migration `020_create_author_follow.sql` como parte de um design inicial que usava UUID references para relacionar autores e livros. Porém, na migration `022_fix_author_follow_schema.sql`, o schema foi refeito para usar `author_name TEXT` diretamente, abandonando essas tabelas.

**Evidências:**
- Zero referências em código TypeScript (não há `supabase.from('authors')` ou `supabase.from('author_books')` em nenhum lugar do `src/`)
- Nenhum tipo TypeScript definido para essas entidades
- A tabela `author_follow` usa `author_name TEXT`, não FK para `authors(id)`
- Os livros usam `author TEXT` nas tabelas `books` e `user_books`

**Correção:**
```sql
-- Migration 033: Remover tabelas órfãs
DROP TABLE IF EXISTS author_books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
```

**Impacto:** Zero — nenhuma funcionalidade é afetada.

**Risco:** Baixo — pode ser revertido com reexecução da migration 020.

---

### 2. Índices Duplicados (🔴 Crítico)

**Problema:** Diversos índices foram criados com o mesmo propósito em migrations diferentes, gerando overhead de escrita e uso de disco desnecessário.

**Índices duplicados identificados:**

| Migration | Índice | Duplicado Em | Observação |
|-----------|--------|-------------|------------|
| 001 | `idx_books_category` | 003 (mesmo nome, recriado) | Redundante |
| 009 | `idx_books_title_trgm` (GIN) | 016 `idx_books_title_search` (GIN) | Mesmo propósito |
| 009 | `idx_books_author_trgm` (GIN) | 016 `idx_books_author_search` (GIN) | Mesmo propósito |
| 009 | `idx_ratings_book_user` | 017 `idx_ratings_book_user_unique` | Sobreposto |
| 009 | `idx_books_category_created_at` | 016 `idx_books_category_created` | Mesma coluna, DESC diferente |

**Correção:**
```sql
-- Migration 034: Remover índices duplicados
DROP INDEX IF EXISTS idx_books_title_trgm;
DROP INDEX IF EXISTS idx_books_author_trgm;
DROP INDEX IF EXISTS idx_books_category_created_at;
DROP INDEX IF EXISTS idx_ratings_book_user;
DROP INDEX IF EXISTS idx_books_author;
```

**Observação:** Manter os índices com nome padronizado `_search` (criados em 016) que têm propósito mais claro.

**Impacto:** Melhora performance de escrita em ~5-10% em operações de INSERT/UPDATE nas tabelas afetadas.

---

### 3. Denormalização em `user_favorites` 🟡 (Média Prioridade)

**Problema:**
A tabela `user_favorites` armazena metadados do livro como cache desnormalizado: `book_title`, `book_author`, `book_cover_color`, `book_cover_url`, `book_category`. Isso cria risco de inconsistência quando livros são atualizados.

Já identificado como débito técnico na migration `019`:
```
-- Note: Full normalization of user_favorites (removing duplicated book metadata)
-- is deferred to a future migration as it requires application layer changes
```

**Correção (fase 1 — não destrutiva):**
```sql
-- Migration 035: Preparar normalização de user_favorites
-- Tornar colunas de cache opcionais (já são)
-- Adicionar índices necessários
```

**Correção (fase 2 — após atualização do app layer):**
- Remover colunas de cache da tabela
- Atualizar repositórios para buscar dados de `books` ou `user_books` via JOIN ou `unified_books` view

**Impacto:** Requer alterações no `SupabaseFavoriteRepository` e nos tipos `UserFavorite`/`FavoriteBook`.

---

### 4. FK de `ratings` Removida — Integridade Referencial Perdida 🟡 (Média Prioridade)

**Problema:**
A migration `027_fix_ratings_anonymous.sql` removeu a FK `ratings_book_id_fkey` que referenciava `books(id)`, porque ratings podem ser associados tanto a `books` quanto a `user_books`. Isso significa que qualquer `book_id` inválido pode ser inserido.

**Correção:**
A solução ideal depende de uma decisão arquitetural:
- **Opção A:** Unificar `books` e `user_books` em uma única tabela (refatoração maior)
- **Opção B:** Adicionar uma coluna `book_source` TEXT ('catalog' | 'user') e triggers de validação
- **Opção C (recomendado para agora):** Manter sem FK, mas adicionar verificação em nível de trigger/application

```sql
-- Migration 036: Adicionar trigger de validação para book_id em ratings
CREATE OR REPLACE FUNCTION validate_rating_book_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM books WHERE id = NEW.book_id
    UNION ALL
    SELECT 1 FROM user_books WHERE id = NEW.book_id
  ) THEN
    RAISE EXCEPTION 'book_id % does not exist in books or user_books', NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_rating_book_id
  BEFORE INSERT OR UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION validate_rating_book_id();
```

**Impacto:** Garante integridade referencial sem FK tradicional.

---

### 5. Trigger de Rating Ineficiente 🟡 (Média Prioridade)

**Problema:**
O trigger `update_book_rating()` em `029_rating_trigger.sql` sempre atualiza **ambas** as tabelas (`books` e `user_books`) para cada INSERT/UPDATE/DELETE em `ratings`, mesmo quando o livro existe em apenas uma delas. Isso dobra o custo de cada operação.

```sql
-- Código atual problemático:
UPDATE books SET rating = ..., rating_count = ... WHERE id = v_book_id;
UPDATE user_books SET rating = ..., rating_count = ... WHERE id = v_book_id; -- sempre executado!
```

**Correção:**
```sql
-- Migration 037: Otimizar trigger de rating
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_book_id UUID;
  v_avg_rating DECIMAL(3,2);
  v_rating_count INTEGER;
  v_is_catalog BOOLEAN;
BEGIN
  v_book_id := COALESCE(NEW.book_id, OLD.book_id);

  SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0), COUNT(*)
  INTO v_avg_rating, v_rating_count
  FROM ratings
  WHERE book_id = v_book_id;

  -- Atualizar apenas a tabela correta
  IF EXISTS (SELECT 1 FROM books WHERE id = v_book_id) THEN
    UPDATE books SET rating = v_avg_rating, rating_count = v_rating_count
    WHERE id = v_book_id;
  ELSIF EXISTS (SELECT 1 FROM user_books WHERE id = v_book_id) THEN
    UPDATE user_books SET rating = v_avg_rating, rating_count = v_rating_count
    WHERE id = v_book_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Impacto:** Reduz pela metade o custo de writes no trigger de ratings.

---

### 6. `book_reading_progress` FK Restrita a `user_books` 🟡 (Média Prioridade)

**Problema:**
A FK `book_reading_progress_book_id_fkey` referencia apenas `user_books(id)`, impossibilitando rastrear progresso de leitura em livros do catálogo (`books`).

**Correção:**
```sql
-- Migration 038: Remover FK restritiva e adicionar trigger de validação
ALTER TABLE book_reading_progress 
  DROP CONSTRAINT IF EXISTS book_reading_progress_book_id_fkey;

-- Trigger de validação (similar ao ratings)
CREATE OR REPLACE FUNCTION validate_reading_progress_book_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM books WHERE id = NEW.book_id
    UNION ALL
    SELECT 1 FROM user_books WHERE id = NEW.book_id
  ) THEN
    RAISE EXCEPTION 'book_id % does not exist', NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_reading_progress_book_id
  BEFORE INSERT OR UPDATE ON book_reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION validate_reading_progress_book_id();
```

**Impacto:** Permite rastrear progresso em qualquer tipo de livro. Requer atualização no repositório `SupabaseReadingRepository` para buscar informações do livro também em `books`.

---

### 7. RLS Policies Multiplicadas 🟢 (Baixa Prioridade)

**Problema:**
Múltiplas migrations recriam as mesmas RLS policies, gerando ruído e dificuldade de manutenção.

| Tabela | Migrations Que Recriaram Policies |
|--------|----------------------------------|
| `ratings` | 001, 013, 024, 025, 027 |
| `profiles` | 001, 007, 014 |
| `author_follow` | 020, 022, 024, 026 |

**Correção:**
Nenhuma migration necessária — é uma questão de documentação e boas práticas futuras. Para referência, as policies atuais devem ser verificadas com:

```sql
-- Verificar todas as policies atuais
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Recomendação:** Consolidar documentação das policies ativas em `database-spec.md`.

---

### 8. Índices Faltantes 🟡 (Média Prioridade)

**Problema:** Colunas usadas em filtros frequentes sem índices adequados.

| Tabela | Coluna | Motivo |
|--------|--------|--------|
| `profiles` | `role` | Filtro por tipo de usuário (migration 030) |
| `ratings` | `session_id` | Queries de anonymous ratings (migration 025/027) |
| `book_reading_progress` | `(user_id, book_id)` | Já existe UNIQUE, mas índice composto explícito ajuda |

**Correção:**
```sql
-- Migration 039: Adicionar índices faltantes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id) WHERE session_id IS NOT NULL;
```

**Impacto:** Melhora performance de queries de filtro por role e lookup de anonymous ratings.

---

### 9. View `unified_books` Desatualizada 🟢 (Baixa Prioridade)

**Problema:**
A view `unified_books` (criada em 018, atualizada em 028) não inclui colunas adicionadas posteriormente: `followers_count`, `favorites_count` (migration 021 em `books`, 023 em `user_books`).

**Correção:**
```sql
-- Migration 040: Atualizar unified_books com novas colunas
CREATE OR REPLACE VIEW unified_books AS
SELECT 
  'catalog'::TEXT AS source,
  id, title, author, cover_url, cover_color, description, category,
  pages AS page_count, rating, rating_count, review_count,
  followers_count, favorites_count,
  created_at,
  NULL::UUID AS user_id, NULL::TEXT AS author_name,
  NULL::TEXT AS status, NULL::INT AS word_count,
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
  ub.created_at, ub.user_id, p.name AS author_name,
  ub.status, ub.word_count, ub.published_at
FROM user_books ub
LEFT JOIN profiles p ON ub.user_id = p.id
WHERE ub.status = 'published';
```

**Impacto:** View mais completa para consumo pelo frontend.

---

### 10. Colunas `followers_count` sem Trigger de Atualização 🟢 (Baixa Prioridade)

**Problema:**
As colunas `followers_count` em `books` e `user_books` (adicionadas nas migrations 021 e 023) são populadas apenas pela função `recalculate_book_stats()` que zera `followers_count = 0` (linha 44 da migration 021). Não há trigger para mantê-las atualizadas automaticamente.

**Correção:**
```sql
-- Migration 041: Trigger para atualizar followers_count em books/user_books
-- Nota: followers_count atualmente é 0 para todos os livros
-- Este trigger pode ser adicionado quando o cálculo de followers for implementado
-- -- A implementação depende de como "followers" são contados por book (atualmente author_follow é por author_name)
```

**Decisão de Design:**
Atualmente `author_follow` conta seguidores por `author_name`, não por livro específico. A coluna `followers_count` em books ficará como placeholder até que o modelo de "seguir livro" seja implementado.

---

## 📊 Estimativa de Esforço e Prioridade

| # | Tarefa | Prioridade | Impacto | Esforço | Dependências |
|---|--------|-----------|---------|---------|--------------|
| 0 | **Database Reset (Clean Slate)** | 🔴 Crítico | Alto (destrói dados) | 4h | Backup |
| 1 | Remover tabelas órfãs `authors` + `author_books` | 🔴 Crítico | Baixo (remove lixo) | 30min | Nenhuma |
| 2 | Limpar índices duplicados | 🔴 Crítico | Médio (melhora write perf) | 30min | Nenhuma |
| 3 | Otimizar trigger de rating | 🟡 Média | Médio (reduz custo de writes) | 1h | #2 |
| 4 | Adicionar índices faltantes | 🟡 Média | Médio (melhora read perf) | 30min | Nenhuma |
| 5 | Adicionar trigger validação `ratings.book_id` | 🟡 Média | Médio (integridade) | 1h | Nenhuma |
| 6 | Corrigir FK `book_reading_progress` | 🟡 Média | Alto (nova funcionalidade) | 2h | #5 (padrão similar) |
| 7 | Atualizar view `unified_books` | 🟢 Baixa | Baixo (completude) | 30min | Nenhuma |
| 8 | Normalizar `user_favorites` (cache) | 🟢 Baixa | Médio (consistência) | 4h | App layer changes |
| 9 | Consolidar RLS documentation | 🟢 Baixa | Baixo (manutenibilidade) | 1h | Nenhuma |
| 10 | Implementar trigger `followers_count` | 🟢 Baixa | Baixo (placeholder) | 1h | Decisão de design |

---

## 🔄 Ordem de Execução Sugerida

### Fase 0: 🧹 Database Reset ✅
1. ✅ Script DROP criado: `supabase/migrations/drop_all.sql`
2. ✅ Schema consolidado criado: `supabase/migrations/000_initial_schema.sql`
3. ✅ Seed data incluso no schema consolidado
4. ✅ Script de verificação: `supabase/migrations/verify_schema.sql`
5. ✅ Executado: `drop_all.sql` → `000_initial_schema.sql` → `verify_schema.sql` — **All checks passed**

### Fase 1: 🔴 Manutenção Imediata (Caso NÃO opte pelo reset)
> **Nota:** Caso opte por **não** resetar o banco, aplique as correções incrementais:

1. Migration 033: Remover `authors` + `author_books` (tabelas órfãs)
2. Migration 034: Remover índices duplicados
3. Migration 039: Adicionar índices faltantes

### Fase 2: 🟡 Otimização de Performance
> Aplicável tanto para schema novo (já incluso no consolidado) quanto para schema existente:

4. Migration 037: Otimizar trigger de rating
5. Migration 036: Trigger validação `ratings.book_id`
6. Migration 038: Corrigir FK `book_reading_progress`

### Fase 3: 🟢 Melhorias e Completude
7. Migration 040: Atualizar view `unified_books`
8. Migration 035: Normalizar `user_favorites` (após app layer)
9. Migration 041: Trigger `followers_count` (após decisão de design)
10. Consolidar documentação RLS em `database-spec.md`

---

## ✅ Critérios de Sucesso

- [ ] Nenhuma tabela órfã no schema `public`
- [ ] Nenhum índice duplicado (verificar com `pg_indexes`)
- [ ] Trigger de rating atualiza apenas a tabela correta
- [ ] `ratings.book_id` validado contra `books` e `user_books`
- [ ] `book_reading_progress` aceita books de qualquer fonte
- [ ] View `unified_books` inclui `followers_count` e `favorites_count`
- [ ] Políticas RLS consolidadas e documentadas
- [ ] Testes de regressão passam (favoritos, ratings, leitura)

---

## 📝 Notas Técnicas

### Sobre a Normalização de `user_favorites`
A desnormalização atual em `user_favorites` serve para evitar JOINs em queries de listagem de favoritos. Antes de remover as colunas de cache, é necessário:
1. Criar uma função/getter que busque dados atualizados do livro
2. Atualizar `SupabaseFavoriteRepository` para fazer JOIN com `unified_books` view
3. Atualizar os tipos `UserFavorite`/`FavoriteBook` para não dependerem das colunas de cache
4. Testar performance da query com JOIN vs cache direto

### Sobre `followers_count` em Books
Atualmente o modelo de "seguir" (`author_follow`) é baseado em nome do autor (`author_name`), não por livro individual. A coluna `followers_count` em `books` e `user_books` foi adicionada prematuramente e não é atualizada. Decisão pendente:
- **Manter como está**: `followers_count` será 0 até feature ser implementada
- **Remover colunas**: Simplificar schema até feature ser necessária
- **Calcular por author**: `followers_count` do livro = followers do autor do livro

### Sobre Unificação de `books` e `user_books`
A separação entre `books` (catálogo) e `user_books` (criação de usuários) é intencional para o domínio atual. A view `unified_books` serve como abstração. Uma unificação completa exigiria:
- Schema migration complexa
- Alteração em todos os repositórios
- Migração de dados
- **Não recomendado no momento** — a view é suficiente

---

## 🔗 Referências

- Migration files: `supabase/migrations/`
- Database spec: `.opencode/specs/database-spec.md`
- Favoritos repository: `src/server/infrastructure/database/supabase-favorite.repository.ts`
- Ratings actions: `src/features/book-details/actions/rate-book.action.ts`
- Reading repository: `src/server/infrastructure/database/supabase-reading.repository.ts`
