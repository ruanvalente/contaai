# /create-feature

## Descrição
Cria uma nova feature seguindo os padrões do projeto Conta.AI.

## Como Usar

```
/create-feature nome-da-feature
```

## Exemplo

```
/create-feature user-notifications
```

## Estrutura Gerada

```
src/features/<feature-name>/
├── actions/
│   └── <feature>.actions.ts
├── hooks/
│   └── use-<feature>.ts
├── types/
│   └── <feature>.types.ts
├── ui/
│   └── <feature>*.ui.tsx
├── widgets/
│   └── <feature>*.widget.tsx
└── README.md
```

## Regras

1. Usar feature-based architecture
2. Seguir naming conventions:
   - UI: *.ui.tsx
   - Widget: *.widget.tsx
   - Hook: use-*.ts
   - Action: *.action.ts
3. Separar UI (visual) de Widgets (lógica)
4. Usar Server Actions para mutações
5. Criar tipos em domain/entities quando apropriado

## Referências

- project-structure-spec.md
- ui-component-spec.md
- widget-component-spec.md
- hooks-spec.md
- server-actions-spec.md
