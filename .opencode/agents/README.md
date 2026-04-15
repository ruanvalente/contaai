# Agentes Customizados - Conta.AI

## Visão Geral
Este diretório contém agentes especializados para o projeto Conta.AI.

---

## Agentes Disponíveis

### 1. reviewer.md
**Propósito:** Code Review
**Focus:** Clean code, Performance, Segurança
**Uso:** Revisão de código pull requests

### 2. architecture.md
**Propósito:** Architecture Advisor
**Focus:** Arquitetura, estrutura, decisões técnicas
**Uso:** Análise de features e refatorações

### 3. database.md
**Propósito:** Database Expert
**Focus:** Supabase, PostgreSQL, queries, RLS
**Uso:** Migrações e otimização de banco

---

## Como Usar

Os agentes são automaticamente invocados baseados no contexto:

```bash
# Para review
@reviewer

# Para análise arquitetural
@architecture

# Para questões de banco
@database
```

---

## Configuração

Agents definidos em `settings.json` e referenciados em `opencode.jsonc`.
