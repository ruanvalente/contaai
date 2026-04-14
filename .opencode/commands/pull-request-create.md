# Descrição

Cria automaticamente um Pull Request completo e padronizado, com:

- Título semântico
- Descrição estruturada
- Checklist de testes
- Issues relacionadas


### IMPORTANTE:
> O conteúdo do PR (título + descrição) deve ser sempre em inglês.

### Como Usar

```bash
/pull-request-create <source-branch> to <target-branch>
```

Exemplo

```bash
/pull-request-create chore/structure-improvement to homolog
```

## Execução do Agente

1. Analisar mudanças

Identificar tipo:

- feat / fix / refactor / docs / chore / etc

Identificar escopo:

- dashboard, auth, books, ui, api, database, config

2. Gerar título semântico

Formato:
```bash
<type>(<scope>): <description>
```

3. Gerar descrição do PR (em inglês)

## Summary
...

## Changes
- ...

## Tests
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] No console errors

## Related Issues
Closes #...

## Output

PR criado **link** do PullRequest no github.

## Pull Request

Source Branch: <source-branch>
Target Branch: <target-branch>


## Title
Sempre em inglês e descritivo a mudança realizada: 

Ex: feat / fix / refactor / docs / chore / etc

## Description

Ser extremamente descritivo e objetivo na sua descrição também em inglês.

## Regras
- Não escrever PR em português
- Não gerar título genérico
- Usar padrão semântico
- Ser claro e objetivo