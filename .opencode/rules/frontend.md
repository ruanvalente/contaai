# Frontend Rules

## Component Architecture

- UI components (*.ui.tsx):
  - Apenas apresentação
  - Sem lógica de negócio
  - Sem useState/useEffect

- Widgets (*.widget.tsx):
  - Responsáveis por estado e interação
  - Podem chamar hooks e server actions

## Client vs Server

- Server Components por padrão
- Usar 'use client' apenas quando necessário

## Boas práticas

- Evitar props drilling
- Usar hooks para reutilização
- Componentes pequenos e focados