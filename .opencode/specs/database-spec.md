# Database Specification

## Description
Este documento define a especificação do banco de dados PostgreSQL para a aplicação Conta.AI, incluindo schema, tabelas, índices, constraints e políticas de segurança baseadas nas melhores práticas do PostgreSQL.

## Baseado em
- PostgreSQL Table Design Skill (`.agents/skills/wshobson-agents/plugins/database-design/skills/postgresql/`)

---

## 1. Livros (books)

### Descrição
Tabela pública de livros do catálogo.

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único do livro |
| title | TEXT | NOT NULL | Título do livro |
| author | TEXT | NOT NULL | Autor do livro |
| cover_url | TEXT | NULL | URL da capa |
| cover_color | TEXT | DEFAULT '#8B4513' | Cor da capa |
| description | TEXT | NULL | Descrição do livro |
| category | TEXT | NOT NULL | Categoria (Sci-Fi, Fantasy, Drama, Business, Education, Geography) |
| pages | INTEGER | DEFAULT 0 | Número de páginas |
| rating | DECIMAL(2,1) | DEFAULT 0 | Avaliação média |
| rating_count | INTEGER | DEFAULT 0 | Contagem de avaliações |
| review_count | INTEGER | DEFAULT 0 | Contagem de resenhas |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

### Índices

```sql
CREATE INDEX idx_books_category ON books(category);
```

### Row-Level Security (RLS)

- **SELECT**: Público (USING true)
- **INSERT**: Apenas usuários autenticados
- **UPDATE/DELETE**: Apenas usuários autenticados

---

## 2. Perfis de Usuário (profiles)

### Descrição
Tabela de perfis que estende auth.users.

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário |
| name | TEXT | NULL | Nome do usuário |
| avatar_url | TEXT | NULL | URL do avatar |
| bio | TEXT | NULL | Biografia do usuário |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

### Row-Level Security (RLS)

- **SELECT**: Público
- **UPDATE**: Apenas próprio usuário (USING auth.uid() = id)

### Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Avaliações (ratings)

### Descrição
Tabela de avaliações de livros por usuários.

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| book_id | UUID | REFERENCES books(id) ON DELETE CASCADE | ID do livro |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário |
| rating | INTEGER | CHECK (rating >= 1 AND rating <= 5) | Avaliação (1-5) |
| review | TEXT | NULL | Texto da resenha |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### Constraints
- UNIQUE(book_id, user_id) - Um usuário pode avaliar um livro apenas uma vez

### Índices

```sql
CREATE INDEX idx_ratings_book_id ON ratings(book_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
```

---

## 4. Livros do Usuário (user_books)

### Descrição
Tabela para livros criados por usuários (stories).

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | ID do criador |
| title | TEXT | NOT NULL | Título |
| author | TEXT | NOT NULL | Autor |
| cover_url | TEXT | NULL | URL da capa |
| cover_color | TEXT | DEFAULT '#8B4513' | Cor da capa |
| content | TEXT | NULL | Conteúdo do livro |
| content_url | TEXT | NULL | URL do conteúdo |
| status | TEXT | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')) | Status |
| reading_status | TEXT | DEFAULT 'none' CHECK (reading_status IN ('none', 'reading', 'completed')) | Status de leitura |
| reading_progress | INTEGER | DEFAULT 0 | Progresso (0-100) |
| category | TEXT | NOT NULL | Categoria |
| word_count | INTEGER | DEFAULT 0 | Contagem de palavras |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de atualização |
| published_at | TIMESTAMPTZ | NULL | Data de publicação |

### Índices

```sql
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_status ON user_books(status);
CREATE INDEX idx_user_books_reading_status ON user_books(reading_status);
CREATE INDEX idx_user_books_category ON user_books(category);
CREATE INDEX idx_user_books_user_status ON user_books(user_id, status);
CREATE INDEX idx_user_books_user_reading ON user_books(user_id, reading_status);
```

### Row-Level Security (RLS)

- **SELECT**: Usuários podem ver seus próprios livros + livros publicados de outros
- **INSERT/UPDATE/DELETE**: Apenas próprio usuário

### Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Favoritos (user_favorites)

### Descrição
Tabela de livros favoritos dos usuários.

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário |
| book_id | UUID | NOT NULL | ID do livro favoritado |
| book_title | TEXT | NOT NULL | Título do livro (cache) |
| book_author | TEXT | NOT NULL | Autor do livro (cache) |
| book_cover_color | TEXT | NULL | Cor da capa (cache) |
| book_cover_url | TEXT | NULL | URL da capa (cache) |
| book_category | TEXT | NULL | Categoria (cache) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de criação |

### Constraints
- UNIQUE(user_id, book_id) - Um usuário não pode favoritar o mesmo livro duas vezes

### Índices

```sql
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
```

### Row-Level Security (RLS)

- **SELECT/INSERT/DELETE**: Apenas próprio usuário

---

## 6. Progresso de Leitura (reading_progress)

### Descrição
Tabela para rastrear progresso de leitura de livros.

### Estrutura

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|-----------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ID único |
| user_id | UUID | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | ID do usuário |
| book_id | UUID | NOT NULL REFERENCES user_books(id) ON DELETE CASCADE | ID do livro |
| progress | INTEGER | DEFAULT 0 CHECK (progress >= 0 AND progress <= 100) | Progresso (0-100) |
| last_position | TEXT | NULL | Última posição (JSON) |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última atualização |

### Constraints
- UNIQUE(user_id, book_id)

---

## Boas Práticas Aplicadas

### 1. Tipos de Dados
- ✅ UUID para IDs com `gen_random_uuid()`
- ✅ TIMESTAMPTZ para timestamps (não usar TIMESTAMP)
- ✅ TEXT para strings (não usar VARCHAR)
- ✅ NUMERIC para valores decimais

### 2. Índices
- ✅ Índices manuais em colunas FK
- ✅ Índices para queries frequentes (category, status, reading_status)

### 3. RLS
- ✅ Row-Level Security habilitado em todas as tabelas
- ✅ Políticas específicas para cada operação

### 4. Constraints
- ✅ CHECK constraints para valores enumerados
- ✅ NOT NULL onde semanticamente necessário
- ✅ Defaults para valores comuns

---

## Migration Pattern

### Criar nova migration

```sql
-- nome-migration.sql em supabase/migrations/
-- Formato: NUMERO_descricao.sql

-- Exemplo: 013_add_new_feature.sql
CREATE TABLE IF NOT EXISTS new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar índices
CREATE INDEX idx_new_feature_name ON new_feature(name);

-- RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;
CREATE POLICY "new_feature_select" ON new_feature FOR SELECT USING (true);
```

---

## Acceptance Criteria

- [ ] Todas as tabelas têm PRIMARY KEY
- [ ] Todas as tabelas com dados sensíveis têm RLS habilitado
- [ ] Foreign keys têm índices para performance
- [ ] Constraints CHECK para valores enumerados
- [ ] Triggers para created_at/updated_at automáticos
- [ ] Migration naming convention segue padrão NUMERO_descricao.sql
