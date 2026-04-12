# Server Actions Rules

## Obrigatório

- Toda mutação deve usar Server Actions
- NÃO usar API routes

## Estrutura

features/*/actions/

## Boas práticas

- Validar dados no server
- Usar cache quando possível (React.cache)
- Evitar chamadas sequenciais (usar Promise.all)

## Fluxo

Widget → Action → Service → Database