# OpenCode Hooks

## Visão Geral
Hooks customizados para automação de tarefas no projeto Conta.AI.

---

## /analyze-feature

Analisa uma feature existente e retorna:
- Estrutura atual
- Pontos de melhoria
- Sugestões de refatoração

**Quando usar:**
- Antes de criar nova feature
- Ao adicionar funcionalidade a feature existente

```bash
# Uso
/analyze-feature nome-da-feature
```

---

## /check-imports

Verifica imports em arquivos e reporta:
- Imports quebrados
- Imports não utilizados
- Sugestões de barrel exports

**Quando usar:**
- Após refatoração
- Para identificar duplicações

---

## /find-component

Encontra componentes pelo padrão de nomeação:
- *.ui.tsx (componentes visuais)
- *.widget.tsx (componentes com lógica)

**Uso:**
/find-component button

---

## /audit-performance

Audita código para problemas de performance:
- waterfall requests
- re-renders desnecessários
- falta de memoização

---

## /validate-structure

Valida estrutura do projeto contra specs:
- project-structure-spec.md
- ui-component-spec.md
- widget-component-spec.md

**Retorna:**
- Lista de arquivos fora do padrão
- Sugestões de correção
