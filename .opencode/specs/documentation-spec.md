# Especificação de Documentação

## Visão Geral

Esta especificação define os padrões, padrões e práticas para criar, manter e gerenciar a documentação no projeto Conta.AI.

## Objetivo

A Especificação de Documentação visa garantir:
- Qualidade consistente da documentação em todo o projeto
- Diretrizes claras para desenvolvedores criarem e atualizarem documentação
- Navegação e descoberta fácil da documentação do projeto
- Integração adequada com fluxos de trabalho de desenvolvimento

## Escopo

Esta especificação abrange:
- Arquivos README (projeto e módulo)
- Documentação de código (JSDoc, TypeDoc)
- Documentação de API
- Architecture Decision Records (ADRs)
- Diretrizes de contribuição
- Guias de desenvolvimento
- Documentação de componentes

## Tipos de Documentação

### 1. Documentação do Projeto

#### README Principal
Localizado em: `/README.md`

O README principal deve conter:
- Visão geral e propósito do projeto
- Stack tecnológica com versões
- Visão geral da arquitetura
- Documentação do schema de banco de dados
- Instruções de configuração e setup
- Scripts disponíveis
- Diretrizes de contribuição
- Informações de licença

#### README de Módulo/Pasta
Quando criar:
- Pastas de features complexas com múltiplos componentes
- Documentação que se aplica a um módulo específico
- Guias específicos de uma área de domínio

Localização: `src/features/[feature]/README.md` ou raiz do módulo relevante

O conteúdo deve incluir:
- Propósito e escopo do módulo
- Componentes principais e suas responsabilidades
- Pontos de integração com outros módulos
- Exemplos de uso

### 2. Documentação de API

Todas as Server Actions e endpoints de API devem incluir:

```typescript
/**
 * [Breve descrição do que esta action faz]
 * 
 * @param [nomeParametro] - [Descrição]
 * @returns [Tipo de retorno e descrição]
 * @throws [Tipos de erro que podem ser lançados]
 * 
 * @example
 * ```typescript
 * const result = await actionName({ param: 'value' });
 * ```
 */
```

### 3. Documentação de Componentes

#### Componentes UI
Localizado: `src/shared/ui/*.ui.tsx`

A documentação deve incluir:
- Interface de props com tipos
- Valores padrão
- Exemplos de uso
- Suporte a variantes/estilos

```typescript
// button.ui.tsx
interface ButtonProps {
  /** Estilo da variante do botão */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg'
  /** Handler de click */
  onClick?: () => void
  /** Conteúdo do botão */
  children: React.ReactNode
}
```

#### Componentes Widget
Localizado: `src/shared/widgets/*.widget.tsx` ou `src/features/*/widgets/`

A documentação deve incluir:
- Gerenciamento de estado (Zustand/useState)
- Efeitos colaterais (useEffect)
- Interface de props
- Contexto de uso
- Pontos de integração

### 4. Architecture Decision Records (ADRs)

Localizado: `docs/adrs/` ou diretório relevante

O formato deve seguir a estrutura padrão de ADR:
- Título
- Status (Proposto/Aceito/Depreciado)
- Contexto
- Decisão
- Consequências
- ADRs relacionados

Consulte a skill `architecture-decision-records` para detalhes.

### 5. Documentação de Banco de Dados

Localizado: `supabase/README.md` ou inline em migrações

Deve incluir:
- Visão geral do schema
- Descrições das tabelas
- Explicação das políticas RLS
- Índices e seus propósitos
- Triggers e funções

### 6. Documentação de Hooks

Localizado: `src/shared/hooks/*.ts` e `src/features/*/hooks/`

Modelo:
```typescript
/**
 * [Nome do hook] - [Breve descrição]
 * 
 * @description [Descrição detalhada do que o hook faz]
 * 
 * @param [nomeParametro] - [Descrição]
 * 
 * @returns [Descrição do valor retornado]
 * 
 * @example
 * ```typescript
 * const { value, actions } = useHookName();
 * ```
 */
```

## Padrões de Documentação

### Linguagem
- **Idioma Primário**: Português (Brasil)
- **Exceção**: Conteúdo voltado para o usuário pode estar em inglês
- Use linguagem clara e concisa
- Evite jargão quando possível; explique quando necessário

### Formatação

#### Blocos de Código
- Use crases triplas com identificador de linguagem
- Inclua comentários para lógica complexa
- Mostre exemplos completos quando possível

```typescript
// Bom
```typescript
const result = await fetchBooks({ category: 'fiction' });
```

#### Caminhos de Arquivo
- Use caminhos absolutos a partir da raiz do projeto
- Inclua extensões de arquivo para clareza

#### Cabeçalhos
- Use hierarquia consistente de cabeçalhos (H1 > H2 > H3)
- H1 apenas para título do documento
- H2 para seções principais
- H3 para subseções

### Diretrizes de Conteúdo

1. **Mantenha atualizado**: A documentação deve refletir o código atual
2. **Seja específico**: Evite declarações vagas
3. **Forneça contexto**: Explique o porquê, não apenas o quê
4. **Inclua exemplos**: Mostre, não apenas conte
5. **Faça referência cruzada**: Linkue documentação relacionada

## Convenções de Nomenclatura de Arquivos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| README | `README.md` | `/README.md` |
| Guia | `*-guide.md` | `deployment-guide.md` |
| ADR | `NNN-*-adr.md` | `001-database-migration-adr.md` |
| Spec | `*-spec.md` | `documentation-spec.md` |

## Checklist de Revisão de Documentação

Antes de publicar a documentação, verifique:
- [ ] Linguagem consistente em todo o documento
- [ ] Exemplos de código testados e funcionando
- [ ] Caminhos de arquivos precisos
- [ ] Links válidos
- [ ] Formatação consistente
- [ ] Ortografia e gramática corretas
- [ ] Conteúdo atualizado com o código atual

## Ferramentas

### Ferramentas Recomendadas

- **Typora** / **VS Code**: Edição de Markdown
- **Docusaurus** / **Nextra**: Para construir sites de documentação
- **ESDoc**: Para gerar documentação de API a partir do código

### Integração com Desenvolvimento

- Revisão de documentação como parte do processo de PR
- Verificações automatizadas de links quebrados
- Documentação com controle de versão

## Manutenção

### Ciclo de Revisão
- **Mensal**: Revisão da documentação principal
- **Em mudança**: Atualize a documentação quando o código mudar
- **Trimestral**: Auditoria completa da precisão da documentação

### Depreciação
- Marque seções desatualizadas como depreciadas
- Inclua caminho de migração quando aplicável
- Defina data de revisão para conteúdo depreciado

## Especificações Relacionadas

Esta especificação referencia e é referenciada por:
- `project-structure-spec.md`
- `server-actions-spec.md`
- `hooks-spec.md`
- `ui-component-spec.md`
- `widget-component-spec.md`
- `database-spec.md`

---

**Última Atualização**: 2026-03-31
**Status**: Ativo
**Ciclo de Revisão**: Mensal