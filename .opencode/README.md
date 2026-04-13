# OpenCode Configuration - Conta.AI

## Visão Geral
Configurações do OpenCode para o projeto Conta.AI, incluindo agents, commands, hooks, rules, skills e specs.

---

## Estrutura

```
.opencode/
├── agents/           # Agentes especializados
├── commands/         # Comandos customizados
├── hooks/            # Hooks de automação
├── plans/            # Planos de trabalho
├── rules/            # Regras arquiteturais
├── skills/           # Skills do agente
├── specs/            # Especificações do projeto
├── opencode.jsonc    # Configuração principal
└── settings.json     # Configurações do ambiente
```

---

## Agentes

| Agente | Propósito |
|--------|-----------|
| `reviewer` | Code Review (clean code, performance, segurança) |
| `architecture` | Advisor arquitetural |
| `database` | Expert em Supabase/PostgreSQL |

---

## Commands

| Comando | Descrição |
|---------|-----------|
| `/create-feature` | Cria nova feature com estrutura padrão |
| `/analyze-feature` | Analisa feature existente |
| `/validate-structure` | Valida estrutura contra specs |

---

## Hooks

| Hook | Descrição |
|------|-----------|
| `analyze-feature` | Analisa estrutura de features |
| `check-imports` | Verifica imports quebrados |
| `find-component` | Encontra componentes pelo padrão |
| `audit-performance` | Audit de performance |
| `validate-structure` | Valida estrutura completa |

---

## Rules

Arquivos em `rules/`:
- `architecture.md` - Pattern feature-based
- `frontend.md` - Componente Architecture
- `naming.md` - Convenções de nomeação
- `server-actions.md` - Server Actions
- `database.md` - Supabase/Postgres
- `design.md` - Design Rules
- `state-management.md` - Zustand
- `performance.md` - Performance
- `testing.md` - Testing

---

## Skills

Skills instalados:
- `feature` - Criação de features
- `bugfix` - Correção de bugs
- `refactor` - Refatoração
- `deploy` - Deploy

---

## Specs

Especificações completas em `specs/`:
- `project-structure-spec.md`
- `ui-component-spec.md`
- `widget-component-spec.md`
- `hooks-spec.md`
- `stores-spec.md`
- `server-actions-spec.md`
- E mais 9 specs...

---

## Plans

Plano ativo: `plans/REFACTOR-NEW.md`

---

## Uso

```bash
# Validar estrutura
/validate-structure

# Criar nova feature
/create-feature nome-da-feature

# Analisar feature
/analyze-feature nome-da-feature
```

---

## Configuração

- **Modelo:** ollama/qwen2.5-coder:latest
- **Stack:** Next.js, Supabase, React, TypeScript
- **Database:** Supabase (PostgreSQL)

---

## Referências

- [AGENTS.md](../AGENTS.md) - Documentação principal do projeto
- [opencode.ai](https://opencode.ai) - Documentação do OpenCode
