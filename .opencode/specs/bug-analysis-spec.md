# Bug Analysis Spec

## Propósito

Este documento fornece um template padronizado para documentar e investigar bugs na aplicação. Ele ajuda a sistematizar o processo de debugging, garantindo que nenhum passo crítico seja perdido e facilitando o compartilhamento de conhecimento entre a equipe.

## Quando Usar Esta Spec

- Reportar novos bugs
- Investigar problemas existentes
- Realizar análise de causa raiz
- Documentar correções de bugs

---

## Seção de Reporte de Bug

### Informações Básicas

| Campo | Descrição |
|-------|-------------|
| **Bug ID** | Identificador único (gerado automaticamente ou número do ticket) |
| **Data do Reporte** | Data quando o bug foi reportado |
| **Reporter** | Pessoa que reportou o bug |
| **Prioridade** | Crítica / Alta / Média / Baixa |
| **Status** | Aberto / Em Progresso / Resolvido / Fechado |

### Ambiente

| Campo | Descrição |
|-------|-------------|
| **Endpoint/Local** | URL ou caminho do arquivo onde o bug ocorre |
| **Ambiente** | Produção / Staging / Desenvolvimento |
| **Browser/Dispositivo** | Nome do browser, versão, SO |
| **Papel do Usuário** | Usuário autenticado / Convidado / Admin |

### Descrição

```
**Sintoma**: [O que o usuário vê - seja específico]
**Comportamento esperado**: [O que deveria acontecer]
**Comportamento atual**: [O que realmente acontece]
**Impacto**: [Como isso afeta os usuários]
```

### Evidência

```markdown
- Stack trace: [colar log relevante]
- Screenshots: [anexar ou descrever]
- Passos de reprodução: [lista numerada]
- Mensagens de erro: [texto exato]
```

---

## Seção de Investigação

### Hipótese de Causa Raiz

Marque todas que se aplicam e explique:

- [ ] Inconsistência entre fontes de dados (different tables/queries)
- [ ] Problema de cache/renderização
- [ ] Filtro incorreto na query
- [ ] Problema de estado/cliente (client state)
- [ ] Race condition
- [ ] Missing/null value handling
- [ ] Outro: _____________

### Passos de Investigação

| Passo | Ação | Resultado | Observações |
|------|------|-----------|-------------|
| 1 | Identificar as fontes de dados utilizadas | [ ] | |
| 2 | Comparar tabelas/queries entre componentes | [ ] | |
| 3 | Verificar se há filtro diferente entre operações | [ ] | |
| 4 | Testar a query diretamente no banco | [ ] | |
| 5 | Verificar logs de erro no console | [ ] | |
| 6 | Verificar dependências e versões | [ ] | |
| 7 | Testar em ambiente limpo | [ ] | |

### Análise de Código

```typescript
// Trechos de código relevantes

// Arquivo: [caminho]
// Função: [nome]
// Linhas: [X-Y]
```

### Queries de Banco

```sql
-- Queries de teste executadas
```

---

## Seção de Resolução

### Descrição da Correção

```
[Descreva a solução implementada]
```

### Arquivos Alterados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| | |

### Testes Realizados

- [ ] Testes unitários adicionados/atualizados
- [ ] Testes de integração passam
- [ ] Teste manual em ambiente dev
- [ ] Verificado que a correção resolve o problema original

### Plano de Rollback

```
[Passos para reverter se necessário]
```

---

## Seção de Prevenção

### Lições Aprendidas

```
[O que poderia ter detectado este bug mais cedo]
```

### Melhorias Sugeridas

- [ ] Adicionar testes automatizados
- [ ] Melhorar logging
- [ ] Adicionar validação de tipos
- [ ] Adicionar error boundaries
- [ ] Outro: _____________

---

## Checklist Rápido

Ao investigar um bug, sempre verifique:

- [ ] Erros de digitação (typos em nomes de variáveis)
- [ ] Case sensitivity
- [ ] Valores null/undefined
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

## Exemplo: Bug de Busca de Livros

### Reporte do Bug

- **Endpoint/Local**: POST /dashboard → searchBooksAction
- **Sintoma**: Pesquisa não retorna itens que deveriam aparecer no dashboard
- **Comportamento esperado**: Todos os livros publicados aparecem na pesquisa
- **Comportamento atual**: Livros da tabela user_books não aparecem na pesquisa

### Causa Raiz

Inconsistência entre fontes de dados: O dashboard exibe livros da tabela `user_books` (com filtro `status = 'published'`), mas a pesquisa (`searchBooksAction`) busca na tabela `books` sem esse filtro. Um livro pode existir em uma tabela e não na outra.

### Passos de Investigação

| Passo | Ação | Resultado |
|------|------|-----------|
| 1 | Identificar fonte de dados do dashboard | tabela `user_books` |
| 2 | Identificar fonte de dados da pesquisa | tabela `books` |
| 3 | Comparar as queries | Diferentes tabelas |
| 4 | Verificar se livros existem em ambas tabelas | Não existem |

### Correção

Alterar `searchBooksAction` para buscar em `user_books` com filtro `status = 'published'` em vez de `books`.

### Arquivos Alterados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `src/features/book-dashboard/actions/books.actions.ts` | Modificado |
