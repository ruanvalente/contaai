# Plano de Testes: Fase 2 - Ações Anônimas Diretas

**Versão:** 2.0  
**Data:** 04/05/2026  
**Fase Testada:** Fase 2 - Ações Anônimas Diretas (via Session ID)  
**Status:** Pendente Execução  

---

## Objetivo

Validar o sistema onde usuários não autenticados podem:
- Navegar livremente pelo site
- Executar ações diretamente (seguir autor, favoritar, avaliar) sem redirecionamento
- Ter suas ações salvas via `sessionId` anônimo no banco
- Manter estado consistente entre sessões anônimas (mesmo navegador)
- Fazer login posterior e manter ações realizadas como anônimo

---

## Preparação

### 1. Servidor de Testes
```bash
cd /Users/ruanvalente/workspace/conta-ai
bun run dev
# Acesar: http://localhost:3000
```

### 2. Dados Necessários
```sql
-- Executar no Supabase SQL Editor
SELECT id, title, author FROM books LIMIT 3;
SELECT id, title FROM user_books WHERE status = 'published' LIMIT 3;

-- Verificar se tabela book_ratings existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'book_ratings'
);
```

---

## Testes de Fluxo - Ações Anônimas Diretas

### 1. Follow Author (Seguir Autor) - Anônimo

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar http://localhost:3000 (anônimo) | Landing page carrega | ⏳ |
| 2 | Clicar em um livro → Abre detalhes | Painel exibe info do livro | ⏳ |
| 3 | Clicar em "Seguir Autor" (sem login) | Botão muda para "Seguindo", sem redirect | ⏳ |
| 4 | Verificar banco (author_follow) | Registro com session_id preenchido, user_id = null | ⏳ |
| 5 | Recarregar página | Estado mantido (ainda "Seguindo") via sessionId | ⏳ |

---

### 2. Favorite Book (Favoritar Livro) - Anônimo

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar http://localhost:3000/explore (anônimo) | Lista de livros carrega | ⏳ |
| 2 | Clicar no ícone de coração (favorite) | Coração preenchido imediatamente, toast sucesso | ⏳ |
| 3 | Verificar banco (favorites) | Registro com session_id, user_id = null | ⏳ |
| 4 | Ir para /dashboard/favorites (sem login) | Redireciona para login (rota protegida) | ⏳ |
| 5 | Fazer login com email usado no sessionId | Favoritos do sessionId devem ser migrados ou mantidos | ⏳ |

---

### 3. Rating Input (Avaliar Livro) - Anônimo

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar http://localhost:3000 (anônimo) | Landing page carrega | ⏳ |
| 2 | Clicar em um livro → Ver RatingInput | Estrelas aparecem para avaliação | ⏳ |
| 3 | Clicar em uma estrela (ex: 4) | Avaliação registrada imediatamente, sem redirect | ⏳ |
| 4 | Verificar banco (ratings) | Registro com session_id, rated_by_type = 'anonymous' | ⏳ |
| 5 | Recarregar página | User rating mantido via sessionId | ⏳ |
| 6 | Passar mouse sobre estrelas | Preview de avaliação funciona | ⏳ |

---

### 4. Read Book (Ler Livro) - Anônimo

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar http://localhost:3000/book/[id] (anônimo) | Livro abre para leitura | ⏳ |
| 2 | Clicar em "Ler Agora" (segue autor automaticamente) | Redireciona para leitura, autor é seguido via sessionId | ⏳ |
| 3 | Verificar se autor foi seguido | No banco: session_id preenchido | ⏳ |
| 4 | Fazer login posterior | Seguir autor mantido via migração ou reassociação | ⏳ |

---

## Testes de Segurança

### 5. Proteção de Rotas (Mantida)

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar /dashboard (anônimo) | Redireciona para / | ⏳ |
| 2 | Acessar /dashboard/editor/[id] (anônimo) | Redireciona para / | ⏳ |
| 3 | Acessar /book/[id]/edit (anônimo) | Redireciona para login ou página do livro | ⏳ |
| 4 | Fazer login → voltar | Acesso liberado | ⏳ |

---

### 6. Server Actions com Anônimos

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Chamar `followAuthor(authorName, sessionId)` sem auth | Sucesso, salva com session_id | ⏳ |
| 2 | Chamar `addToFavorites(bookId, ..., sessionId)` sem auth | Sucesso, salva com session_id | ⏳ |
| 3 | Chamar `rateBook(bookId, rating, sessionId)` sem auth | Sucesso, salva com session_id e rated_by_type='anonymous' | ⏳ |
| 4 | Chamar actions sem sessionId e sem auth | Erro ou falha (deve ter um dos dois) | ⏳ |

```bash
# Teste curl para rateBook (Server Action)
curl -X POST http://localhost:3000/api/rate-book \
  -H "Content-Type: application/json" \
  -d '{"bookId": "test", "rating": 5, "sessionId": "anonymous-test-123"}'
```

---

## Testes de Persistência de Sessão Anônima

### 7. Session ID e LocalStorage

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Acessar site (anônimo) | `getAnonymousSessionId()` gera e salva ID no localStorage | ⏳ |
| 2 | Verificar no DevTools → Application → LocalStorage | `anonymous_session_id` presente | ⏳ |
| 3 | Recarregar página | Mesmo sessionId mantido | ⏳ |
| 4 | Fazer login | sessionId pode ser migrado ou mantido separado | ⏳ |
| 5 | Limpar localStorage | Novo sessionId gerado na próxima visita | ⏳ |

```javascript
// Verificar no console do browser
localStorage.getItem('anonymous_session_id')
```

---

### 8. Compatibilidade com Lazy Auth (Pending Actions)

| Passo | Ação | Resultado Esperado | Status |
|------|------|-------------------|--------|
| 1 | Clicar em "Seguir" com lazy auth ativado | pending_action salvo no localStorage | ⏳ |
| 2 | Fazer login | pending_action processado e removido | ⏳ |
| 3 | Verificar se ação foi executada | Autor seguido com user_id (não session_id) | ⏳ |

---

## Checklist de Validação

### Funcionais
- [ ] Follow Author executa diretamente para anônimos (sem redirect)
- [ ] Follow é salvo com session_id (user_id = null) no banco
- [ ] Favorite Book executa diretamente para anônimos (sem redirect)
- [ ] Favorito é salvo com session_id no banco
- [ ] Rating Input executa diretamente para anônimos
- [ ] Rating salvo com rated_by_type = 'anonymous'
- [ ] Estado mantido ao recarregar página (via sessionId)
- [ ] Toast de sucesso aparece após ação executada

### Não-Funcionais
- [ ] Ações anônimas respondem em < 500ms
- [ ] sessionId persiste no localStorage entre sessões
- [ ] Loading states exibidos durante requisições
- [ ] UI mantém consistência após recarregar

### Segurança
- [ ] Server actions requerem sessionId OU userId (não aceitam vazio)
- [ ] Rotas protegidas (/dashboard, /book-dashboard) bloqueiam anônimos
- [ ] Usuário logado usa user_id (não session_id)
- [ ] sessionId não pode ser facilmente forjado (randomizado)

---

## Arquivos Testados

| Arquivo | Tipo | Testar |
|---------|------|--------|
| `src/shared/hooks/use-auth-redirect.ts` | Hook | save/get/clear PendingAction (compatibilidade) |
| `src/features/auth/actions/require-auth.action.ts` | Action | requireAuthOrThrow (para rotas protegidas) |
| `src/features/author-follow/widgets/author-follow.widget.tsx` | Widget | follow direto com sessionId |
| `src/features/author-follow/actions/author-follow.actions.ts` | Action | followAuthor(authorName, sessionId) |
| `src/features/author-follow/hooks/use-author-follow.ts` | Hook | Store com suporte a anônimos |
| `src/features/book-details/widgets/book-details-panel.widget.tsx` | Widget | Rating/favorite com getAnonymousSessionId() |
| `src/features/book-details/ui/rating-input.ui.tsx` | UI | Input interativo chamando onRate direto |
| `src/features/book-details/actions/rate-book.action.ts` | Action | rateBook(bookId, rating, sessionId) |
| `src/features/discovery/actions/favorites.actions.ts` | Action | addToFavorites(..., sessionId) |
| `src/shared/lib/anonymous-session.ts` | Lib | getAnonymousSessionId() gera e persiste |
| `src/features/auth/widgets/login-form.widget.tsx` | Widget | Processa pending actions (compatibilidade) |

---

## Relatório de Execução

### Data: ___/___/2026
### Executado por: _______________

| Categoria | Passou | Falhou | Pendente |
|-----------|--------|--------|----------|
| Follow Author | _ | _ | _ |
| Favorite Book | _ | _ | _ |
| Rating Input | _ | _ | _ |
| Read Book | _ | _ | _ |
| Proteção Rotas | _ | _ | _ |
| Server Actions | _ | _ | _ |
| Persistência | _ | _ | _ |

### Observações:
_________________________________________________________________________

### Bugs Encontrados:
1. ____________________________________________________________________
2. ____________________________________________________________________
3. ____________________________________________________________________

---

## Próximos Passos (Pós-Testes)

### Se todos os testes passarem:
- [ ] Atualizar status no plano principal para "Fase 2 Testada e Aprovada"
- [ ] Fazer commit das alterações
- [ ] Liberar para Fase 3 (Diferenciação Leitor × Autor)

### Se houver falhas:
- [ ] Corrigir bugs identificados
- [ ] Re-executar testes afetados
- [ ] Documentar limitações conhecidas
