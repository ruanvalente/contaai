# Plano de Melhoria de Estrutura - Conta.AI

## 🎯 Objetivo

Aplicar as recomendações de refatoração identificadas na validação de estrutura para atingir 95%+ de conformidade.

---

## 📋 Recomendações e Plano de Execução

### 1. Mover auth/components para widgets (Média Prioridade)

**Problema:** Arquivos em pasta incorreta
- `src/features/auth/components/register-form.widget.tsx`
- `src/features/auth/components/login-form.widget.tsx`

**Correção:**
```bash
# Mover arquivos
mv src/features/auth/components/register-form.widget.tsx src/features/auth/widgets/
mv src/features/auth/components/login-form.widget.tsx src/features/auth/widgets/

# Atualizar imports em:
# - src/app/login/page.tsx
# - src/app/register/page.tsx

# Remover pasta components vazia
rmdir src/features/auth/components
```

**Impacto:** Baixo - apenas move arquivos e atualiza imports

---

### 2. Auditoria de Arquivos Órfãos em book-dashboard (Baixa Prioridade)

**Problema:** Duplicação de funcionalidades entre:
- `book-dashboard/` → `library/` e `editor/`

**Arquivos a verificar:**
- `book-dashboard/widgets/book-editor.widget.tsx` → usar `editor/widgets/book-editor.widget.tsx`
- `book-dashboard/widgets/library-content.widget.tsx` → usar `library/widgets/library-content.widget.tsx`
- `book-dashboard/widgets/favorites-content.widget.tsx` → usar `library/widgets/favorites-content.widget.tsx`
- `book-dashboard/widgets/create-book-modal.widget.tsx` → usar `library/widgets/create-book-modal.widget.tsx`
- `book-dashboard/hooks/use-book-editor.ts` → usar `editor/hooks/use-book-editor.ts`
- `book-dashboard/hooks/use-editor-publish.ts` → usar `editor/hooks/use-editor-publish.ts`

**Plano:**
1. Mapear imports de cada arquivo órfão
2. Atualizar para usar as versões nas features corretas
3. Remover arquivos duplicados após migração de imports

**Nota:** Alguns arquivos podem ainda ser necessários se houver diferença de funcionalidade. Avaliar caso a caso.

---

### 3. Criar Barrel Exports (index.ts) (Baixa Prioridade)

**Problema:** Imports longos e potencialmente frágeis

**Features que precisam:**

| Feature | Arquivo Export | Status |
|---------|-----------------|--------|
| library | `actions/index.ts` | ❌ Criar |
| library | `hooks/index.ts` | ❌ Criar |
| library | `widgets/index.ts` | ❌ Criar |
| editor | `actions/index.ts` | ❌ Criar |
| editor | `hooks/index.ts` | ✅ Já existe |
| editor | `widgets/index.ts` | ❌ Criar |
| discovery | `hooks/index.ts` | ❌ Criar |
| profile | `actions/index.ts` | ❌ Criar |
| profile | `widgets/index.ts` | ❌ Criar |
| book-details | `widgets/index.ts` | ❌ Criar |
| book-details | `ui/index.ts` | ❌ Criar |

**Exemplo de estrutura:**

```typescript
// src/features/library/actions/index.ts
export * from './user-books.actions';

// src/features/library/hooks/index.ts
export * from './use-user-books';
export * from './use-library-tabs';
export * from './use-library-state';
```

---

## 📊 Estimativa de Esforço

| Tarefa | Prioridade | Impacto | Esforço |
|--------|------------|---------|---------|
| Mover auth/components → widgets | Média | Baixo | 1h |
| Auditoria book-dashboard | Baixa | Médio | 4h |
| Criar barrel exports | Baixa | Baixo | 2h |

---

## 🔄 Ordem de Execução Sugerida

1. **Fase 1** (✅ Concluído): Mover auth/components para widgets
2. **Fase 2** (✅ Concluído): Auditoria e limpeza de book-dashboard
3. **Fase 3** (✅ Concluído): Criar barrel exports

---

## ✅ Critérios de Sucesso

1. Pasta `components/` removida ou não utilizada
2. `book-dashboard/` sem arquivos duplicados
3. Cada feature com pelo menos barrel export de actions
4. Score de conformidade >= 95%

---

## 📝 Notas

- Estas são melhorias **opcionais** - o projeto já funciona corretamente
- Priorizar apenas se houver necessidade de refatoração maior
- A migração para repositories já realizada é muito mais importante que estas melhorias