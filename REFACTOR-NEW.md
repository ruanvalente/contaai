# REFACTOR-NEW.md - Plano de Refatoracao Conta.AI

## Visao Geral

Este plano documenta a estrategia de refatoracao para o projeto Conta.AI, estruturado em 5 fases organizadas por criticidade (da mais critica para menos critica). O plano e baseado nas specs e skills do projeto, garantindo conformidade com os padroes estabelecidos.

---

## Fase 0: Analise e Preparacao (CONCLUIDA)

### 0.1 Decisoes Arquiteturais Confirmadas

| Decisao | Escopo |
|---------|--------|
| Tipos de Domínio | `src/domain/entities/` como fonte primária |
| Tipos UI/View | `src/shared/types/` para derivados |
| Domínio | Mantido como parte da arquitetura |
| Arquitetura Base | Features + Shared + Server Actions |

### 0.2 Estrutura Real (Apos Analise)

| Categoria | Localizacao | Status |
|-----------|-------------|--------|
| UI Components | `src/shared/ui/` | Parcialmente padronizado |
| Widgets | `src/shared/widgets/` | Padrão .widget.tsx OK |
| Hooks | `src/shared/hooks/` | Padrão use-*.ts OK |
| Stores Globais | `src/shared/store/` | Vazio - mover de features |
| Tipos Domínio | `src/domain/entities/` | ja existe |
| Tipos Features | `src/features/*/types/` | Alguns duplicados |

### 0.3 Problemas Identificados

| # | Problema | Escopo | Criticidade |
|---|----------|-------|-------------|
| 1 | Componentes UI sem extensão `.ui.tsx` | ~12 arquivos em `shared/ui/` | CRITICA |
| 2 | Stores em `discovery/stores/` | 4 stores precisam migrar | CRITICA |
| 3 | Book-dashboard estrutura caótica | 7+ pastas problemáticas | ALTA |
| 4 | Tipos em features duplicando domain | `discovery/types/`, `reading/types/` | MEDIA |
| 5 | Falta de barrel exports | Vários diretórios | BAIXA |

---

## Fase 1: Padronizacao UI/Widget (CONCLUIDA)

**Objetivo:** Garantir que todos os componentes sigam as Convencoes definidas em ui-component-spec.md e widget-component-spec.md.

### 1.1 Componentes UI Renomeados

| De | Para | Status |
|----|------|--------|
| avatar.tsx | avatar.ui.tsx | CONCLUIDO |
| badge.tsx | badge.ui.tsx | CONCLUIDO |
| book-cover.tsx | book-cover.ui.tsx | CONCLUIDO |
| button.tsx | button.ui.tsx | CONCLUIDO |
| container.tsx | container.ui.tsx | CONCLUIDO |
| search-input.tsx | search-input.ui.tsx | CONCLUIDO |
| sidebar.tsx | sidebar.ui.tsx | CONCLUIDO |
| star-rating.tsx | star-rating.ui.tsx | CONCLUIDO |
| stats-card.tsx | stats-card.ui.tsx | CONCLUIDO |
| tabs.tsx | tabs.ui.tsx | CONCLUIDO |
| topbar.tsx | topbar.ui.tsx | CONCLUIDO |
| header.tsx | header.ui.tsx | JA TINHA .UI.TSX |

### 1.2 Imports Atualizados

Arquivos que tiveram imports atualizados para apontar para os novos nomes:
- `src/features/profile/widgets/avatar-upload.widget.tsx`
- `src/shared/ui/header.ui.tsx`
- `src/features/reading/ui/author-info.ui.tsx`
- `src/features/book-dashboard/widgets/book-details-panel.widget.tsx`
- `src/features/discovery/widgets/landing-hero.widget.tsx`
- `src/features/discovery/widgets/landing-header.widget.tsx`
- `src/features/discovery/widgets/landing-book-carousel.widget.tsx`
- `src/features/profile/pages/settings.page.tsx`
- `src/features/discovery/pages/landing.page.tsx`
- `src/features/discovery/pages/discover.page.tsx`
- `src/features/book-dashboard/widgets/content-recovery-modal.widget.tsx`
- `src/features/book-dashboard/widgets/library-content.widget.tsx`
- `src/features/book-dashboard/widgets/category-content.widget.tsx`
- `src/features/book-dashboard/widgets/downloads-content.widget.tsx`
- `src/features/book-dashboard/widgets/favorites-content.widget.tsx`
- `src/features/book-dashboard/widgets/categories-section.widget.tsx`
- `src/features/book-dashboard/widgets/book-editor.widget.tsx`
- `src/features/book-dashboard/widgets/create-book-modal.widget.tsx`
- `src/features/book-dashboard/widgets/book-editor-header.widget.tsx`
- `src/features/auth/components/register-form.widget.tsx`
- `src/features/book-dashboard/pages/book-dashboard.page.tsx`
- `src/features/auth/components/login-form.widget.tsx`
- `src/shared/widgets/dashboard-shell.widget.tsx`
- `src/shared/widgets/book-card.widget.tsx`
- `src/shared/ui/published-notification.ui.tsx`
- `src/shared/ui/library-header.ui.tsx`
- `src/shared/ui/empty-library-state.ui.tsx`
- `src/app/dashboard/dashboard-shell-client.tsx`
- `src/shared/widgets/user-dropdown.widget.tsx`

### 1.3 Criterios de Aceitacao

- [x] Todos componentes visuais puros tem extensao .ui.tsx
- [x] Todos componentes com logica tem extensao .widget.tsx
- [x] Display names definidos para debugging
- [x] Build passa sem erros

---

## Fase 2: Consolidacao de Tipos (PENDENTE)

**Objetivo:** Usar domain/entities como fonte centralizada e consolidar imports em features.

### 2.1 Mapeamento de Tipos Reais

| Tipo | Arquivo Atual | Usado em |
|------|---------------|----------|
| Book | `/src/domain/entities/book.entity.ts` | discovery, library, reading |
| UserBook | `/src/domain/entities/user-book.entity.ts` | book-dashboard, library |
| UserFavorite | `/src/domain/entities/favorite.entity.ts` | discovery |
| Category | `/src/domain/entities/book.entity.ts` | book-dashboard, discovery |
| ReadingProgress | `/src/domain/entities/reading-progress.entity.ts` | reading |

### 2.2 Acao Pendente

- [ ] Features devem importar de `@/domain/entities`
- [ ] Tipos em features/*/types/ que duplicam domain devem ser removidos
- [ ] Novos tipos derivados podem ir para `src/shared/types/`

### 2.3 Criterios de Aceitacao

- [ ] Imports em features apontando para @/domain/entities
- [ ] Tipos duplicados em features removidos
- [ ] Breaking changes documentadas

---

## Fase 3: Reorganizacao de Features (PENDENTE)

**Objetivo:** Garantir estrutura consistente e mover stores para local correto.

### 3.1 Stores em discovery/stores/

**Local atual:** `src/features/discovery/stores/`
**Local destino:** `src/shared/store/`

Stores a mover:
| Arquivo | Status |
|--------|--------|
| category-cache.store.ts | PENDENTE |
| favorites.store.ts | PENDENTE |
| pagination-cache.store.ts | PENDENTE |
| search.store.ts | PENDENTE |

### 3.2 Estrutura Alvo Features

```
src/features/
├── auth/
├── discovery/
├── library/
├── profile/
├── reading/
└── book-dashboard/
```

### 3.3 Criterios de Aceitacao

- [ ] Estrutura features/*/ segue padrao consistente
- [ ] shared/ contem apenas componentes reutilizaveis
- [ ] Stores global state em src/shared/store/
- [ ] Features state em src/features/<feature>/store/

---

## Fase 4: Otimizacoes e Polish (PENDENTE)

**Objetivo:** Melhorar organizacao e adicionar conveniencias.

### 4.1 Barrel Exports

Criar index.ts em diretorios-chave:
```
src/shared/ui/index.ts
src/shared/widgets/index.ts
src/shared/hooks/index.ts
src/shared/store/index.ts
src/shared/types/index.ts
```

### 4.2 Criterios de Aceitacao

- [ ] Barrel exports criados em src/shared/
- [ ] Imports simplificados via index.ts
- [ ] Documentacao atualizada

---

## Fase 5: Testes e Validacao (PENDENTE)

**Objetivo:** Garantir que refatoracao nao quebrou funcionalidades.

### 5.1 Checklist de Validacao

| Teste | Descricao | Prioridade | Status |
|-------|-----------|------------|--------|
| Auth Flow | Login, registro, logout | CRITICA | PENDENTE |
| Book Discovery | Busca, filtros, categorias | CRITICA | PENDENTE |
| Favorites | Adicionar/remover favoritos | ALTA | PENDENTE |
| Library | Tabs, lista de livros | ALTA | PENDENTE |
| Reading | Abrir livro, salvar progresso | ALTA | PENDENTE |
| Editor | Criar, editar, publicar livro | MEDIA | PENDENTE |

### 5.2 Comando de Validacao

```bash
# Validacao automatica (executar apos cada fase)
bun run lint
bun run build
```

### 5.3 Criterios de Aceitacao

- [ ] Todos os fluxos principais testados
- [ ] Nenhum erro de console
- [ ] Performance aceitavel
- [ ] Build succeeds
- [ ] Tests pass (se houver)

---

## execucao

### Progresso Geral

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 0: Analise e Preparacao | CONCLUIDA | 100% |
| Fase 1: Padronizacao UI/Widget | CONCLUIDA | 100% |
| Fase 2: Consolidacao de Tipos | PENDENTE | 0% |
| Fase 3: Reorganizacao de Features | PENDENTE | 0% |
| Fase 4: Otimizacoes e Polish | PENDENTE | 0% |
| Fase 5: Testes e Validacao | PENDENTE | 0% |

### Proxima Etapa

A proxima fase a ser executada e a **Fase 2: Consolidacao de Tipos**.

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Breaking changes em imports | ALTA | ALTO | Fazer em commits separados |
| Perda de funcionalidade | BAIXA | ALTO | Testes manuais apos cada fase |
| Conflitos de merge | MEDIA | MEDIO | Trabalhar em branch separada |
| Regressao de performance | BAIXA | MEDIO | Medir antes e depois |

---

## Referencias

- UI Component Spec
- Widget Component Spec
- Hooks Spec
- Stores Spec
- Server Actions Spec
- Project Structure Spec
- Vercel React Best Practices Skill
- Frontend Design Skill

---

Plano atualizado conforme progresso da refatoracao