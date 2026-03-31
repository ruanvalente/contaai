# Pull Request Spec

## Propósito

Este documento define os padrões para criação e revisão de pull requests no projeto. Garante consistência, qualidade e comunicação efetiva entre a equipe.

## Quando Usar Esta Spec

- Criar novos pull requests
- Revisar pull requests
- Configurar templates de PR

---

## Convenção de Título do PR

Use o formato de commits semânticos no título:

```
<tipo>(<escopo>): <descrição>
```

### Tipos

| Tipo | Descrição |
|------|------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Mudanças de estilo (formatação, sem lógica) |
| `refactor` | Mudança de código que não corrige nem adiciona |
| `perf` | Melhoria de performance |
| `test` | Adicionar ou atualizar testes |
| `chore` | Manutenção, dependências, mudanças de build |

### Escopo

Opcional. Indica a área afetada:

- `dashboard`
- `auth`
- `books`
- `ui`
- `database`
- `api`
- `config`

### Exemplos

```
feat(dashboard): adicionar funcionalidade de busca de livros
fix(auth): resolver problema de redirecionamento no login
docs(readme): atualizar instruções de instalação
refactor(books): simplificar função formatBook
```

---

## Template de Descrição do PR

```markdown
## Resumo
[Breve descrição do que este PR faz]

## Mudanças
- [Mudança 1]
- [Mudança 2]
- [Mudança 3]

## Testes
- [ ] Testes unitários passam
- [ ] Teste manual realizado
- [ ] Sem erros no console

## Screenshots
[Se houver mudanças na UI, adicionar screenshots]

## Issues Relacionadas
Closes #[número da issue]
```

---

## Diretrizes de PR

### Antes de Criar PR

- [ ] Todos os testes passam localmente
- [ ] Código segue as convenções do projeto
- [ ] Sem erros de lint
- [ ] Título do PR segue convenção semântica
- [ ] Descrição está completa

### Requisitos de Revisão

- Pelo menos 1 aprovação necessária
- Todos os comentários resolvidos
- Checks de CI passando

### Após o Merge

- Branch deletada (opcional)
- Issue relacionada fechada

---

## Referência Rápida

| Cenário | Tipo |
|---------|------|
| Nova funcionalidade | `feat` |
| Correção de bug | `fix` |
| Performance | `perf` |
| Refatoração | `refactor` |
| Documentação | `docs` |
| Testes | `test` |
| Dependências | `chore` |

---

## Exemplo: PR de Correção do Bug de Busca

### Título

```
fix(books): alinhar searchBooksAction com fonte de dados do dashboard
```

### Descrição

```markdown
## Resumo
Corrigida a funcionalidade de busca para usar a mesma fonte de dados (tabela `user_books`) que o dashboard, garantindo que livros publicados apareçam nos resultados de busca.

## Mudanças
- Alterada tabela de `books` para `user_books` em searchBooksAction
- Adicionado filtro `status = 'published'` na query de busca
- Atualizado formatador de `formatBook` para `formatUserBook`

## Testes
- [x] Lint passa
- [x] Teste manual em ambiente dev
- [x] Verificado que busca retorna livros publicados de user_books

## Issues Relacionadas
Closes #21
```
