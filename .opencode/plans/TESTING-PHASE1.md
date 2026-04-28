# Testes - Fase 1: Acesso Público a Livros

## Pré-requisitos

1. Migration `024_enable_public_read_access.sql` executada
2. Servidor local rodando: `bun run dev`
3. Não estar logado (ou testar em aba anônima)

## Cenários de Teste

### 1. Landing Page com Livros Reais

**Passos:**
1. Acesse `http://localhost:3000/`
2. Verifique se o carousel/lista de livros exibe dados do banco
3. Confirme que **não há** dados hardcoded ("Harry Potter", etc.)

**Esperado:** Livros do catálogo (`books`) e publicados (`user_books`) aparecem.

---

### 2. Leitura Pública de Livro

**Passos:**
1. Clique em qualquer livro da landing page
2. OU acesse diretamente `http://localhost:3000/book/[id]`

**Esperado:**
- Página carrega **sem pedir login**
- Conteúdo do livro é exibido
- Controles de leitura funcionam

**Verificar no console:**
```bash
# Deve mostrar books do banco, não erro de auth
```

---

### 3. Busca de Livros

**Passos:**
1. Na landing page, use a busca
2. Digite termo de busca (ex: nome de autor existente)

**Esperado:** Resultados da busca aparecem com livros públicos.

---

### 4. Filtro por Categoria

**Passos:**
1. Aplique filtro de categoria na lista de livros

**Esperado:** Livros filtrados corretamente.

---

## Testes via curl (verificar API)

### Listar livros públicos (sem auth)
```bash
curl -s "http://localhost:3000/api/books" | head -100
```

### Acessar livro específico
```bash
# Substitua pelo ID de um livro existente no banco
curl -s "http://localhost:3000/book/SEU_BOOK_ID" | grep -o "<title>.*</title>"
```

---

## Verificar no Console do Browser

1. Abra DevTools (F12)
2. Aba Network → filtre por XHR/Fetch
3. Navegue pela landing page
4. **Não deve ver** requisições 401 Unauthorized para `/book/`

---

## Checklist de Validação

| Teste | Status |
|-------|--------|
| Landing page exibe livros do banco | ☐ |
| Livro abre sem login | ☐ |
| Busca retorna resultados públicos | ☐ |
| Filtro por categoria funciona | ☐ |
| Sem erros 401 no network | ☐ |

---

## Dados de Teste

Para verificar, use IDs de livros que existem no banco:

```sql
-- Listar livros publicados (execute no Supabase SQL Editor)
SELECT id, title, status FROM user_books WHERE status = 'published';
SELECT id, title FROM books LIMIT 5;
```