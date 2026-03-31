# Bug Analysis Spec

## Purpose

This spec provides a standardized template for documenting and investigating bugs in the application. It helps systematize the debugging process, ensuring no critical steps are missed and facilitating knowledge sharing across the team.

## When to Use This Spec

- Reporting new bugs
- Investigating existing issues
- Performing root cause analysis
- Documenting bug fixes

---

## Bug Report Section

### Basic Information

| Field | Description |
|-------|-------------|
| **Bug ID** | Unique identifier (auto-generated or ticket number) |
| **Date Reported** | Date when the bug was first reported |
| **Reporter** | Person who reported the bug |
| **Priority** | Critical / High / Medium / Low |
| **Status** | Open / In Progress / Resolved / Closed |

### Environment

| Field | Description |
|-------|-------------|
| **Endpoint/Location** | URL or file path where the bug occurs |
| **Environment** | Production / Staging / Development |
| **Browser/Device** | Browser name, version, OS |
| **User Role** | Authenticated user / Guest / Admin |

### Description

```
**Sintoma**: [What the user sees - be specific]
**Comportamento esperado**: [What should happen]
**Comportamento atual**: [What actually happens]
**Impacto**: [How this affects users]
```

### Evidence

```markdown
- Stack trace: [paste relevant log]
- Screenshots: [attach or describe]
- Reproduction steps: [numbered list]
- Error messages: [exact text]
```

---

## Investigation Section

### Root Cause Hypothesis

Check all that apply and explain:

- [ ] Inconsistência entre fontes de dados (different tables/queries)
- [ ] Problema de cache/renderização
- [ ] Filtro incorreto na query
- [ ] Problema de estado/cliente (client state)
- [ ] Race condition
- [ ] Missing/null value handling
- [ ] Outro: _____________

### Investigation Steps

| Step | Action | Result | Notes |
|------|--------|--------|-------|
| 1 | Identificar as fontes de dados utilizadas | [ ] | |
| 2 | Comparar tabelas/queries entre componentes | [ ] | |
| 3 | Verificar se há filtro diferente entre operações | [ ] | |
| 4 | Testar a query diretamente no banco | [ ] | |
| 5 | Verificar logs de erro no console | [ ] | |
| 6 | Verificar dependências e versões | [ ] | |
| 7 | Testar em ambiente limpo | [ ] | |

### Code Analysis

```typescript
// Relevant code snippets

// File: [path]
// Function: [name]
// Lines: [X-Y]
```

### Database Queries

```sql
-- Test queries executed
```

---

## Resolution Section

### Fix Description

```
[Describe the solution implemented]
```

### Files Changed

| File | Change Type |
|------|-------------|
| | |

### Testing Performed

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing in dev environment
- [ ] Verified fix resolves original issue

### Rollback Plan

```
[Steps to revert if needed]
```

---

## Prevention Section

### Lessons Learned

```
[What could have caught this bug earlier]
```

### Improvements Suggested

- [ ] Add automated tests
- [ ] Improve logging
- [ ] Add type validation
- [ ] Add error boundaries
- [ ] Other: _____________

---

## Quick Checklist

When investigating a bug, always verify:

- [ ] Spelling errors (typos in variable names)
- [ ] Case sensitivity
- [ ] Null/undefined values
- [ ] Array index off-by-one
- [ ] Async timing (race conditions)
- [ ] Scope issues
- [ ] Type mismatches
- [ ] Missing dependencies
- [ ] Environment variables
- [ ] File paths (absolute vs relative)
- [ ] Cache issues
- [ ] Stale data

---

## Example: Search Books Bug

### Bug Report

- **Endpoint/Location**: POST /dashboard → searchBooksAction
- **Sintoma**: Pesquisa não retorna itens que deveriam aparecer no dashboard
- **Comportamento esperado**: Todos os livros publicados aparecem na pesquisa
- **Comportamento atual**: Livros da tabela user_books não aparecem na pesquisa

### Root Cause

Inconsistência entre fontes de dados: O dashboard exibe livros da tabela `user_books` (com filtro `status = 'published'`), mas a pesquisa (`searchBooksAction`) busca na tabela `books` sem esse filtro. Um livro pode existir em uma tabela e não na outra.

### Investigation Steps

| Step | Action | Result |
|------|--------|--------|
| 1 | Identificar fonte de dados do dashboard | `user_books` table |
| 2 | Identificar fonte de dados da pesquisa | `books` table |
| 3 | Comparar as queries | Diferentes tabelas |
| 4 | Verificar se livros existem em ambas tabelas | Não existem |

### Fix

Alterar `searchBooksAction` para buscar em `user_books` com filtro `status = 'published'` em vez de `books`.

### Files Changed

| File | Change Type |
|------|-------------|
| `src/features/book-dashboard/actions/books.actions.ts` | Modified |
