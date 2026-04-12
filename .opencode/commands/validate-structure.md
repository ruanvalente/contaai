# /validate-structure

## Descrição
Valida a estrutura do projeto contra as specs definidas.

## Como Usar

```
/validate-structure
```

## O que Valida

### 1. Estrutura de Pastas
- `src/features/` segue feature-based
- `src/shared/` contém ui/, widgets/, hooks/, store/
- `src/app/` segue Next.js App Router

### 2. Nomeação de Arquivos
- UI components: *.ui.tsx
- Widgets: *.widget.tsx
- Hooks: use-*.ts
- Stores: *.store.ts
- Actions: *.action.ts

### 3. Separação de Responsabilidades
- UI não contém lógica de negócio
- Widgets contém estado e handlers
- Server Actions para mutações
- Services para regras de negócio

## Output

- Lista de arquivos fora do padrão
- Sugestões de correção
- Score de conformidade

## Referências

- project-structure-spec.md
- ui-component-spec.md
- widget-component-spec.md
- REFACTOR-NEW.md
