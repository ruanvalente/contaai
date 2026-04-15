# /analyze-feature

## Descrição
Analisa uma feature existente e retorna recomendações arquiteturais.

## Como Usar

```
/analyze-feature nome-da-feature
```

## Exemplo

```
/analyze-feature book-dashboard
```

## Output

Retorna:
- Estrutura atual da feature
- Pontos de melhoria
- Sugestões de refatoração baseadas em:
  - project-structure-spec.md
  - REFACTOR-NEW.md
  - ui-component-spec.md
  - widget-component-spec.md

## Regras

1. Verificar se feature segue padrão feature-based
2. Verificar separação ui/widgets/actions/hooks
3. Verificar naming conventions
4. Identificar código duplicado
5. Sugerir melhorias quando aplicável
