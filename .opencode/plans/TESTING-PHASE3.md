# Plano de Testes: Fase 3 - Diferenciação Leitor × Autor

**Versão:** 2.0  
**Data:** 08/05/2026  
**Fase Testada:** Fase 3 - Diferenciação Leitor × Autor  
**Status:** Pendente Execução  

---

## Objetivo

Validar o sistema de diferenciação entre perfis de leitor e autor, garantindo que:

- Usuários com livros publicados sejam classificados como **autor**
- Leitores sem publicações sejam classificados como **leitor**
- A landing page redirecione usuários logados para o dashboard
- O role seja detectado automaticamente e persista entre sessões
- O role fique disponível no `useAuthStore` para uso futuro

> **Nota:** A sidebar NÃO possui mais diferenciação por perfil. A seção "Autor" com links "Dashboard Autor" e "Criar Livro" foi removida conforme decisão de produto.

---

## Preparação

### 1. Executar Migration no Supabase

```sql
-- Executar no Supabase SQL Editor (Dashboard → SQL Editor)
-- Copie o conteúdo de: supabase/migrations/030_add_user_role.sql
-- Ou execute via CLI:
-- psql -h <host> -d <db> -f supabase/migrations/030_add_user_role.sql
```

### 2. Verificar Migration

```sql
-- Confirmar que coluna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Verificar roles atribuídos
SELECT id, name, role FROM profiles ORDER BY role;

-- Verificar se autores foram detectados
SELECT p.id, p.name, p.role, COUNT(ub.id) as published_books
FROM profiles p
LEFT JOIN user_books ub ON ub.user_id = p.id AND ub.status = 'published'
GROUP BY p.id, p.name, p.role
ORDER BY published_books DESC;
```

### 3. Servidor de Testes

```bash
bun run dev
# Acessar: http://localhost:3000
```

---

## Testes de Fluxo

### 1. Migration e Banco de Dados

| Teste | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 1.1 | Verificar coluna `role` em `profiles` | Coluna existe com CHECK (`reader`/`author`), default `reader` | ⏳ |
| 1.2 | Verificar auto-update de autores existentes | Profiles de usuários com livros publicados têm `role = 'author'` | ⏳ |
| 1.3 | Trigger `auto_update_author_role` ao publicar livro | Usuário que publica livro tem role alterado para `'author'` automaticamente | ⏳ |
| 1.4 | Trigger `auto_downgrade_author_role` ao remover último livro | Autor sem livros publicados tem role rebaixado para `'reader'` | ⏳ |

### 2. Auth Store - Role no Login

| Passo | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 1 | Fazer login como leitor (sem livros publicados) | `user.role === 'reader'` | ⏳ |
| 2 | Fazer login como autor (com livros publicados) | `user.role === 'author'` | ⏳ |
| 3 | Verificar estado no console | `useAuthStore.getState().user.role` retorna o role correto | ⏳ |
| 4 | Recarregar página | Role mantido após reload | ⏳ |
| 5 | Fazer logout | `user.role` volta para `undefined` (usuário anônimo) | ⏳ |

```javascript
// Verificar no console do browser
// useAuthStore é um module, importe via:
// const store = (await import('@/shared/storage/use-auth-store')).useAuthStore
// store.getState().user?.role
```

### 3. Landing Page - Redirecionamento

| Passo | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 1 | Acessar `/` (anônimo) | Landing page carrega normalmente com todos os componentes | ⏳ |
| 2 | Fazer login (qualquer perfil) | É redirecionado para `/dashboard` | ⏳ |
| 3 | Acessar `/` (logado) | Redireciona automaticamente para `/dashboard` sem flash | ⏳ |
| 4 | Fazer logout | Landing page volta a funcionar para anônimos | ⏳ |
| 5 | Login → redirect → logout → acesso | Ciclo completo funciona sem erros | ⏳ |

### 4. Server Action `getUserRole`

| Teste | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 4.1 | Chamar `getUserRole()` autenticado como leitor | Retorna `'reader'` | ⏳ |
| 4.2 | Chamar `getUserRole()` autenticado como autor | Retorna `'author'` | ⏳ |
| 4.3 | Chamar `getUserRole()` sem autenticação | Retorna `null` | ⏳ |
| 4.4 | Chamar `getUserRole()` para usuário sem role explícito | Detecta automaticamente (fallback para published books) | ⏳ |

### 5. Auth Store - Role no Login

| Teste | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 5.1 | Fazer login como leitor (sem livros publicados) | `user.role === 'reader'` | ⏳ |
| 5.2 | Fazer login como autor (com livros publicados) | `user.role === 'author'` | ⏳ |
| 5.3 | Recarregar página logado | Role mantido após reload | ⏳ |
| 5.4 | Fazer logout | `user.role` volta para `undefined` (anônimo) | ⏳ |
| 5.5 | `onAuthStateChange` dispara login social | Role atualizado corretamente | ⏳ |

```javascript
// Verificar no console do browser (após login)
// (await import('@/shared/storage/use-auth-store')).useAuthStore.getState().user?.role
```

---

## Testes de Regressão

### 6. Funcionalidades Existentes (não devem quebrar)

| Teste | Ação | Resultado Esperado | Status |
|-------|------|-------------------|--------|
| 6.1 | Anônimo acessa `/explore` | Funciona sem login (Fase 1) | ⏳ |
| 6.2 | Anônimo lê livro em `/book/[id]` | Leitura pública funciona (Fase 1) | ⏳ |
| 6.3 | Anônimo segue autor | Ação salva com `sessionId` (Fase 2) | ⏳ |
| 6.4 | Anônimo avalia livro | Rating salvo com `sessionId` (Fase 2) | ⏳ |
| 6.5 | Anônimo favorita livro | Favorito salvo com `sessionId` (Fase 2) | ⏳ |
| 6.6 | Rotas protegidas (`/dashboard`, `/editor`) | Bloqueiam anônimos (Fases 1-2) | ⏳ |
| 6.7 | Register form | Cria conta com role default `'reader'` | ⏳ |

---

## Checklist de Validação

### Migration e Banco
- [ ] Coluna `role` adicionada à tabela `profiles` com CHECK constraint
- [ ] Usuários com livros publicados têm `role = 'author'`
- [ ] Trigger atualiza role automaticamente ao publicar/remover livro
- [ ] Trigger funciona tanto para INSERT quanto para UPDATE de status

### Auth Store
- [ ] `AuthUser.role` populado corretamente após login
- [ ] Role detectado via profile OU fallback (published books)
- [ ] `initialize()` busca role do profile no banco
- [ ] `onAuthStateChange` atualiza role corretamente
- [ ] Logout limpa role (volta a `undefined`)

### Landing Page
- [ ] Anônimo vê landing page completa (hero, books, comunidade, footer)
- [ ] Usuário logado é redirecionado para `/dashboard`
- [ ] `initialize()` é chamado no useEffect do componente
- [ ] Sem flash da landing page antes do redirect
- [ ] Ciclo login → redirect → logout → landing funciona

### Segurança
- [ ] Role não é exposto em rotas públicas não-autenticadas
- [ ] Apenas usuário autenticado vê seu próprio role
- [ ] `getUserRole` retorna `null` para anônimos

---

## Arquivos Envolvidos na Fase 3

| Arquivo | Tipo | Testar |
|---------|------|--------|
| `supabase/migrations/030_add_user_role.sql` | Migration | Coluna role, triggers de auto-update/downgrade |
| `src/features/auth/actions/get-user-role.action.ts` | Action | Server action com detecção automática |
| `src/shared/storage/use-auth-store.ts` | Store | AuthUser.role no initialize e onAuthStateChange |
| `src/features/discovery/pages/landing.page.tsx` | Page | Redirect para /dashboard se logado |

---

## Relatório de Execução

### Data: ___/___/2026
### Executado por: _______________

| Categoria | Passou | Falhou | Pendente |
|-----------|--------|--------|----------|
| Migration / Banco | _ | _ | _ |
| Auth Store / Role | _ | _ | _ |
| Landing Page / Redirect | _ | _ | _ |
| Server Action getUserRole | _ | _ | _ |
| Regressão (Fases 1-2) | _ | _ | _ |

### Observações:
_________________________________________________________________________

### Bugs Encontrados:
1. ____________________________________________________________________
2. ____________________________________________________________________
3. ____________________________________________________________________

---

## Próximos Passos (Pós-Testes)

### Se todos os testes passarem:
- [ ] Atualizar status no plano principal para "Fase 3 Testada e Aprovada"
- [ ] Fazer commit das alterações
- [ ] Liberar para Fase 4 (Limitações para Anônimos)

### Se houver falhas:
- [ ] Corrigir bugs identificados
- [ ] Re-executar testes afetados
- [ ] Documentar limitações conhecidas
