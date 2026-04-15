# /bug-fix-refactor

## Descrição

Analisa bugs com foco em causa raiz, aplica a correção e automaticamente executa refatorações estruturais para evitar recorrência.

Opera em modo Staff Engineer + Arquitetura Evolutiva.

### Como usar

```
/bug-fix-refactor <descrição-do-bug>
```

```
/bug-fix-refactor busca não retorna livros publicados no dashboard
```


### Modo de Execução do Agente

Execute em ordem obrigatória:

### 1. Context & Impact Analysis
- O bug é sintoma de problema maior?
- Existe inconsistência entre features?
- Há duplicação de lógica ou dados?

Classifique:

- Local / Cross-feature / Global

### 2. Feature Mapping

Identifique a feature:

src/features/<feature-name>/

Mapeie:

- UI
- Widgets
- Hooks
- Actions
- Services

Se necessário, analisar profundamente:

```
/analyze-feature <feature-name>
```

### 3. Root Cause Detection

Identifique a camada:

- UI
- Widget
- Hook
- Action
- Service
- Database

Valide o fluxo:

```
UI → Widget → Hook → Action → Service → DB
```

### 4. Full Investigation

Verificar:

- Inconsistência de dados
- Queries divergentes
- Filtros incorretos
- Problemas de estado
- Race conditions
- null/undefined
- Tipagem
- Dependências

### 5. Diagnóstico (Obrigatório)

Explique claramente:

- O que está quebrado
- Onde está quebrado
- Por que acontece
- Qual a causa raiz

### 6. Smart Fix (Causa Raiz)

Aplicar correção:

- Corrigir origem do problema
- Remover workaround
- Garantir consistência entre features

### 7. 🔥 Auto-Refactor (Obrigatório)

Após corrigir, avaliar e executar melhorias automaticamente:

#### 7.1 Estrutura
- Garantir padrão feature-based
- Ajustar separação:
- UI (visual)
- Widget (estado/lógica)
- Hook (reuso)
- Action (mutação)
- Service (regra de negócio)

#### 7.2 Centralização de Lógica

Se houver duplicação:

Mover para:

- services/
- ou shared/

#### 7.3 Data Consistency

- Unificar fonte de dados
- Padronizar queries
- Garantir consistência entre features

#### 7.4 Naming & Conventions

Validar:

- *.ui.tsx
- *.widget.tsx
- use-*.ts
- *.actions.ts

#### 7.5 Feature Decomposition

Se detectar complexidade excessiva:

Quebrar em sub-features

#### 7.6 Server Actions
- Garantir que mutações estão em Actions
- Evitar lógica de negócio em UI/Widget

### 8. Validação Completa

Garantir:

- Bug resolvido
- Arquitetura consistente
- Sem regressões

Checklist:

- Teste manual
- Fluxo completo OK
- Edge cases cobertos

## 9. Output Obrigatório

### Bug Report

#### Sintoma:
[descrição]

#### Causa raiz:
[explicação]

### Diagnóstico

Camada afetada:

- Fluxo impactado:
- Impacto: (Local / Cross / Global)

## Correção Aplicada

```
// antes/depois
```

## Refatoração Aplicada

Estrutura
- [o que foi reorganizado]

Lógica
- [o que foi centralizado]

Dados
- [o que foi unificado]

## Arquivos Alterados
- path/file.ts
- path/file2.ts

## Validação
- [x] Bug resolvido
- [x] Sem regressões
- [x] Arquitetura consistente

## Melhorias Futuras

[opcional]

#### Regras Críticas
- Nunca corrigir só o sintoma
- Não duplicar lógica
- Não manter inconsistência de dados
- Não deixar regra de negócio em UI
- Sempre corrigir causa raiz
- Sempre avaliar refatoração
- Pensar em escala e manutenção
- Aplicar padrões do projeto
🔗 Integração com Sistema

Pode ser combinado com:

```
/analyze-feature
/validate-structure
```

## Modo Mental do Agente

Atuar como:

- Staff Engineer
- Arquiteto de Software
- Revisor de Código Sênior

Sempre perguntando:

```
“Isso resolve só hoje ou melhora o sistema como um todo?”
```