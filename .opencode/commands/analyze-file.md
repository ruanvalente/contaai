# /analyze-file

## Descrição

Analisa um arquivo específico do projeto (componente, hook, service, etc.) e retorna recomendações estruturais, de padrão e qualidade de código com base nas convenções definidas.

## Como Usar

```
/analyze-file caminho/do/arquivo
```

## Exemplo

```
/analyze-file features/book/widgets/book-card.widget.tsx
```

## Output

Retorna:
- Tipo do arquivo (componente, hook, service, util, etc.)
- Responsabilidade atual do arquivo
- Avaliação de aderência aos padrões do projeto
- Problemas identificados
- Sugestões de refatoração baseadas em:
  - project-structure-spec.md
  - REFACTOR-NEW.md
  - ui-component-spec.md
  - widget-component-spec.md

## Regras

1. Estrutura e Organização
- Verificar se o arquivo está no diretório correto (feature-based)
- Verificar se o tamanho do arquivo está adequado (evitar arquivos muito grandes)
- Avaliar se há múltiplas responsabilidades (violação de SRP)

2. Tipo e Padrão do Arquivo

Identificar corretamente o tipo:
- UI Component
- Widget
- Hook / Composable
- Service / UseCase
- Util
- Validar se segue o padrão esperado para aquele tipo

3. Componentização (quando aplicável)

Verificar separação entre:

- UI (presentational)
- lógica (hooks/composables)
- ações (services/useCases)
- Identificar necessidade de extração de subcomponentes

4. Naming Conventions

- Nome do arquivo está consistente com o padrão?
- Nome do componente/função é descritivo?
- Evitar nomes genéricos (ex: data, handle, utils)

5. Acoplamento e Coesão

- Verificar dependências desnecessárias
- Identificar alto acoplamento
- Avaliar se o arquivo depende de muitas camadas

6. Reutilização

- Identificar código duplicado
- Verificar se poderia ser extraído para:
- hooks
- utils
- componentes compartilhados

7. Complexidade

Avaliar:

- tamanho de funções
- número de condições
- legibilidade
- Sugerir simplificações

8. Boas Práticas (React, Next.js, Vue, Nuxt.js / Frontend)

- Separação de script/template/style adequada
- Uso correto de props/emits
- Evitar lógica pesada no template
- Uso adequado de hooks, widgets, ui, store e utils.