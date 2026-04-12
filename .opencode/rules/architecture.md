# Architecture Rules

## Pattern

- Feature-based architecture

## Estrutura

features/
- ui/
- widgets/
- actions/
- hooks/
- services/
- types/

shared/
- ui/
- widgets/
- hooks/
- store/
- utils/

## Separação

- UI → visual
- Widget → interação
- Action → mutação
- Service → regra de negócio

## Anti-patterns

- Lógica em UI
- Misturar client/server
- Arquivos grandes