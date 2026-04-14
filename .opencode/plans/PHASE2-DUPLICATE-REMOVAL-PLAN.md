# Plano de Remoção de Arquivos Duplicados - Fase 2

## 🎯 Objetivo

Remover arquivos duplicados órfãos em `book-dashboard/widgets/` que possuem versões equivalentes em `library/widgets/`.

---

## 📋 Análise

### Arquivos Duplicados Identificados

| Arquivo | Versão Original | Status Uso |
|---------|-----------------|------------|
| `book-dashboard/widgets/create-book-modal.widget.tsx` | `library/widgets/create-book-modal.widget.tsx` | ❌ Não usado |
| `book-dashboard/widgets/favorites-content.widget.tsx` | `library/widgets/favorites-content.widget.tsx` | ❌ Não usado |
| `book-dashboard/widgets/library-content.widget.tsx` | `library/widgets/library-content.widget.tsx` | ❌ Não usado |

### Comparação de Diferenças

1. **create-book-modal.widget.tsx**: Diferença apenas no import path
2. **favorites-content.widget.tsx**: Arquivos idênticos
3. **library-content.widget.tsx**: Diferença apenas no import path

### Pages que Usam Versões Corretas

```typescript
// src/app/dashboard/library/page.tsx
import { LibraryContent } from "@/features/library/widgets/library-content.widget";

// src/app/dashboard/favorites/page.tsx
import { FavoritesContent } from "@/features/library/widgets/favorites-content.widget";
```

---

## ✅ Plano de Execução

### Passo 1: Remover Arquivos Duplicados

```bash
# Remover arquivos órfãos de book-dashboard/widgets/
rm src/features/book-dashboard/widgets/create-book-modal.widget.tsx
rm src/features/book-dashboard/widgets/favorites-content.widget.tsx
rm src/features/book-dashboard/widgets/library-content.widget.tsx
```

### Passo 2: Atualizar SPECs (Opcional)

Os arquivos de spec referenciam paths antigos que não são usados em código real. Atualizar:
- `.opencode/specs/page-routing-spec.md:116`
- `.opencode/specs/page-routing-spec.md:271`

### Passo 3: Verificar Build

```bash
bun run build
```

---

## 📊 Estimativa

| Tarefa | Esforço |
|--------|---------|
| Remover 3 arquivos duplicados | 5 min |
| Atualizar SPECs (opcional) | 10 min |
| Verificar build | 2 min |

---

## ✅ Critérios de Sucesso

1. Arquivos duplicados removidos
2. Pages continuam funcionando (usam versões de `library/widgets/`)
3. Build passa sem erros