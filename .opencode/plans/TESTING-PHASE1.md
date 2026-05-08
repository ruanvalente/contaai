# Plano de Testes: Fase 1 - MVP Acesso Público

**Versão:** 1.0  
**Data:** 29/04/2026  
**Fase Testada:** Fase 1 - MVP Acesso Público  
**Status:** Pendente Execução  

---

## Objetivo

Validar todas as funcionalidades implementadas na Fase 1 do plano de Acesso Leitor Anônimo, garantindo que usuários não autenticados possam:
- Visualizar livros na landing page
- Explorar catálogo completo em `/explore`
- Ler livros publicados sem login
- Navegar sem barreiras de autenticação

---

## Escopo de Testes

### 1. Landing Page com Livros Reais

#### 1.1 Backend - `getPublicBooksAction`
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Carrega livros unificados | Integração | Retorna livros de `books` + `user_books` publicados | ⏳ |
| Paginação funciona | Integração | 20 livros por página, `hasMore` correto | ⏳ |
| View `unified_books` acessível | Integração | Query executa sem erro | ⏳ |

#### 1.2 Frontend - Componentes
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Carousel com dados reais | E2E | Substituiu hardcoded, exibe livros do banco | ⏳ |
| `PublicBookGrid` renderiza | Unitário | Grid responsivo exibe cards | ⏳ |
| Lazy loading imagens | E2E | Imagens carregam ao entrar no viewport | ⏳ |
| Skeleton durante loading | E2E | Exibe skeleton até dados carregarem | ⏳ |

---

### 2. Página Explore (`/explore`)

#### 2.1 Navegação e Acesso
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Acesso sem login | E2E | `/explore` carrega sem redirect | ⏳ |
| Link "Explorar" no header | E2E | Clica e vai para `/explore` | ⏳ |
| Link "Ver todos os livros" | E2E | Em landing page funciona | ⏳ |
| Middleware permite acesso | E2E | Não bloqueia rota pública | ⏳ |

#### 2.2 Funcionalidades de Descoberta
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Grid de livros exibe | E2E | Cards com capa, título, autor | ⏳ |
| Busca funciona | E2E | Filtra por título/autor em tempo real | ⏳ |
| Filtro categoria | E2E | `CategoryFilter` filtra corretamente | ⏳ |
| Paginação navega | E2E | Anterior/Próxima funcionam | ⏳ |
| Empty state aparece | E2E | "Nenhum livro encontrado" quando vazio | ⏳ |

#### 2.3 Layout e UX
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Grid responsivo | E2E | `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` | ⏳ |
| Motion animations | E2E | Framer-motion consistente | ⏳ |
| Fundo `bg-primary-200` | E2E | Cor de fundo igual "Obras em Destaque" | ⏳ |
| `BookCard` isFeatured | E2E | 3 primeiros livros destacados | ⏳ |

---

### 3. Leitura Pública (`/book/[id]`)

#### 3.1 Acesso e Middleware
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Leitura sem login | E2E | `/book/[id]` carrega para anônimo | ⏳ |
| Middleware libera rota | E2E | Proxy permite `/book/` sem auth | ⏳ |
| Edição requer auth | E2E | `/book/[id]/edit` redireciona para login | ⏳ |
| `/book-dashboard/` requer auth | E2E | Redireciona se não autenticado | ⏳ |

#### 3.2 RLS (Row Level Security)
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Anônimo vê livros publicados | Integração | RLS permite SELECT em `user_books` com status='published' | ⏳ |
| Anônimo não vê rascunhos | Integração | RLS bloqueia livros com status != 'published' | ⏳ |
| `book_reading_progress` leitura | Integração | Anônimo pode ler (sem escrever) | ⏳ |

#### 3.3 Interface para Anônimos
| Teste | Tipo | Critério | Status |
|-------|------|----------|--------|
| Botões edição ocultos | E2E | Anônimo não vê botões de editar/excluir | ⏳ |
| `useAuthStore` modo anonymous | Unitário | Fallback funciona corretamente | ⏳ |
| Leitura do conteúdo | E2E | Páginas do livro carregam normalmente | ⏳ |

---

## Comandos de Execução

### Testes Unitários e de Integração
```bash
# Executar todos os testes
bun run test

# Testes específicos da Fase 1
bun run test -- --testPathPattern="public-books|explore|book"

# Cobertura
bun run test:coverage
```

### Testes E2E (Playwright/Cypress)
```bash
# Executar E2E
bun run e2e

# E2E modo UI
bun run e2e:ui

# E2E específico Fase 1
bun run e2e -- --grep "Fase 1|Acesso Público"
```

### Verificação Manual
```bash
# Iniciar servidor de desenvolvimento
bun run dev

# Acessar:
# - http://localhost:3000 (Landing)
# - http://localhost:3000/explore (Explore)
# - http://localhost:3000/book/[id] (Leitura)
```

---

## Critérios de Aceite

### Funcionais
- [ ] Anônimo acessa landing page e vê livros reais
- [ ] Página `/explore` funciona sem login com filtros e busca
- [ ] Leitura de livros publicados acessível sem autenticação
- [ ] Middleware não bloqueia rotas públicas (`/`, `/explore`, `/book/`)
- [ ] RLS permite leitura de livros publicados para anônimos
- [ ] Botões de edição ocultos para usuários não autenticados

### Não-Funcionais
- [ ] Performance: Página carrega em < 2s
- [ ] Lazy loading de imagens funcionando
- [ ] Skeleton exibido durante carregamento
- [ ] Responsividade em mobile/desktop
- [ ] Motion animations fluidas (framer-motion)

### Segurança
- [ ] RLS policies ativas e testadas
- [ ] Anônimo NÃO consegue escrever em `user_books`
- [ ] Rotas de edição (`/edit`, `/book-dashboard`) bloqueadas

---

## Arquivos Envolvidos na Fase 1

| Arquivo | Tipo | Testar |
|---------|------|--------|
| `src/features/public-books/actions/public-books.actions.ts` | Action | Query, paginação, filtros |
| `src/features/public-books/widgets/public-search.widget.tsx` | Widget | Busca funcional |
| `src/features/public-books/ui/category-filter.ui.tsx` | UI | Filtro por categoria |
| `src/features/public-books/ui/public-book-grid.ui.tsx` | UI | Grid responsivo, skeletons |
| `src/features/public-books/hooks/use-public-books.ts` | Hook | Estado, paginação |
| `src/app/explore/page.tsx` | Page | Renderização, layout |
| `src/features/discovery/widgets/landing-header.widget.tsx` | Widget | Link "Explorar" |
| `src/features/discovery/widgets/books-showcase.widget.tsx` | Widget | Botão "Ver todos" |
| `src/proxy.ts` | Middleware | Rotas públicas |
| `supabase/migrations/0XX_update_rls.sql` | Migration | RLS policies |

---

## Relatório de Execução

### Data: ___/___/2026
### Executado por: _______________

| Categoria | Passou | Falhou | Pendente |
|-----------|--------|--------|----------|
| Backend/Integração | _ | _ | _ |
| Frontend Unitário | _ | _ | _ |
| E2E | _ | _ | _ |
| Manual | _ | _ | _ |

### Observações:
_________________________________________________________________________

### Bugs Encontrados:
1. ____________________________________________________________________
2. ____________________________________________________________________
3. ____________________________________________________________________

---

## Próximos Passos (Pós-Testes)

### Se todos os testes passarem:
- [ ] Liberar para Fase 2 (Autenticação Lazy)
- [ ] Atualizar status no plano principal para "Fase 1 Testada e Aprovada"
- [ ] Fazer deploy da Fase 1 em staging

### Se houver falhas:
- [ ] Corrigir bugs identificados
- [ ] Re-executar testes afetados
- [ ] Atualizar documentação se necessário
