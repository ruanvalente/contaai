# /check-compliance

## Descrição

Verifica a conformidade do projeto Conta.AI com todas as specs definidas em `.opencode/specs/`.

## Como Usar

```
/check-compliance
```

## O que Valida

### 1. Estrutura de Pastas (project-structure-spec.md)

Verifica se a estrutura segue o padrão feature-based:

```
src/
├── features/              # Features por domínio
│   ├── auth/
│   ├── library/
│   ├── editor/
│   ├── profile/
│   ├── discovery/
│   └── book-dashboard/
├── shared/               # Componentes compartilhados
│   ├── ui/              # *.ui.tsx
│   ├── widgets/         # *.widget.tsx
│   ├── hooks/           # use-*.ts
│   ├── store/           # *.store.ts
│   └── utils/
└── app/                  # Next.js App Router
```

### 2. Componentes UI (ui-component-spec.md)

Verifica:

- [ ] Componentes seguem extensão `.ui.tsx`
- [ ] Usam `forwardRef` para expor DOM nodes
- [ ] Display name definido para debugging
- [ ] Props estendem `ComponentPropsWithoutRef` quando apropriado
- [ ] Usam `cn()` utility para merging de classes
- [ ] Não têm estado interno (useState)
- [ ] Não fazem fetch de dados diretamente
- [ ] São puramente presentacionais

### 3. Componentes Widget (widget-component-spec.md)

Verifica:

- [ ] Widgets seguem extensão `.widget.tsx`
- [ ] Sempre usam diretiva `"use client"`
- [ ] Separação clara entre UI (presentacional) e Widget (lógica)
- [ ] Integração com stores Zustand quando necessário
- [ ] Integração com Server Actions para mutações
- [ ] Estados de loading e error tratados
- [ ] Callbacks seguem convenção `onAction`

### 4. Hooks (hooks-spec.md)

Verifica:

- [ ] Hooks seguem convenção `use-*.ts`
- [ ] Sempre começam com prefixo `use`
- [ ] São funções, não componentes
- [ ] Retorno tipado explicitamente
- [ ] Callbacks memoizados com `useCallback`
- [ ] Computações memoizadas com `useMemo`

### 5. Stores (stores-spec.md)

Verifica:

- [ ] Stores seguem extensão `.store.ts`
- [ ] Tipos definidos para estado e ações
- [ ] Mutação de estado via `set((state) => ...)`
- [ ] Uso de `get()` para acesso ao estado atual quando necessário
- [ ] Seletores específicos para evitar re-renders

### 6. Server Actions (server-actions-spec.md)

Verifica:

- [ ] Actions seguem extensão `.action.ts`
- [ ] Usam diretiva `"use server"`
- [ ] Parametros tipados
- [ ] Error handling adequado
- [ ] Uso de `cache()` para queries frequentes

### 7. Nomeação (naming.md)

Verifica convenções:

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente UI | `*.ui.tsx` | `button.ui.tsx` |
| Widget | `*.widget.tsx` | `book-card.widget.tsx` |
| Hook | `use-*.ts` | `use-favorites.ts` |
| Store | `*.store.ts` | `favorites.store.ts` |
| Action | `*.action.ts` | `books.action.ts` |
| Pasta | `kebab-case` | `book-dashboard/` |

### 8. Barrel Exports

Verifica presença de `index.ts` em:

- `src/shared/ui/index.ts`
- `src/shared/widgets/index.ts`
- `src/shared/hooks/index.ts`
- `src/shared/store/index.ts`
- `src/features/*/actions/index.ts`
- `src/features/*/hooks/index.ts`
- `src/features/*/widgets/index.ts`

## Output

Retorna um relatório de conformidade:

```markdown
## Relatório de Conformidade

### ✅ Em Conformidade
- Estrutura de pastas
- Componentes UI
- Widgets
- ...

### ⚠️ Necessita Atenção
- Barrel exports faltando em: profile/hooks
- ...

### ❌ Fora do Padrão
- book-dashboard/widgets/auth-form.widget.tsx (nome incorreto)
- ...

### Score Geral: 92%
```

## Referências

- `project-structure-spec.md`
- `ui-component-spec.md`
- `widget-component-spec.md`
- `hooks-spec.md`
- `stores-spec.md`
- `server-actions-spec.md`
- `naming.md`