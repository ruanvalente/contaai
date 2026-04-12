#!/bin/bash

set -e

MODEL="${OLLAMA_MODEL:-deepseek-coder:latest}"
MAX_TOKENS="${OLLAMA_MAX_TOKENS:-4096}"
TEMPERATURE="${OLLAMA_TEMPERATURE:-0.7}"

show_help() {
  cat << EOF
🤖 AI CLI - Assistente de desenvolvimento local

Usage: ai <comando> [opções] [args...]

Comandos:
  chat          Inicia sessão de chat interativo
  edit         Edita um arquivo com instruções
  create      Cria novo arquivo a partir de especificação
  refactor     Refatora código existente
  explain      Explica o que o código faz
  test         Gera testes para código
  commit      Gera mensagem de commit (git)
  doc          Gera documentação
  fix          Tenta resolver erro/bug

Opções:
  -m, --model <model>  Modelo Ollama (padrão: deepseek-coder:latest)
  -f, --file <path>   Arquivo para editar/explicar
  -t, --temp <num>    Temperature (0-1, padrão: 0.7)
  -h, --help          Mostra esta ajuda

Exemplos:
  ai chat
  ai edit -f src/app/page.tsx "adicione um botão"
  ai explain -f src/utils/auth.ts
  ai commit
  ai fix "Error: Cannot read property 'id' of undefined"

Modelos disponíveis:
  deepseek-coder:latest   Recomendado para código (776MB)
  qwen2.5-coder:latest   Para tarefas pesadas (4.7GB)
  qwen3.5:latest        Para chat geral (6.6GB)
EOF
}

get_prompt_template() {
  local task="$1"
  local content="$2"
  local extra="$3"

  case "$task" in
    chat)
      echo "$content"
      ;;
    edit)
      cat << EOF
Você é um desenvolvedor Senior Fullstack Next.js, TypeScript, React, Tailwind.

Analise o seguinte código:
\`\`\`typescript
$content
\`\`\`

Instrução: $extra

Retorne apenas as alterações necessárias no formato diff:
\`\`\`typescript
// código alterado completo
\`\`\`
EOF
      ;;
    create)
      cat << EOF
Você é um desenvolvedor Senior Fullstack Next.js 16, TypeScript, React 19, Tailwind CSS 4.

Crie o código completo conforme especificação:
$content

Retorne apenas o código final, sem explicações extras.
\`\`\`typescript
// código completo
\`\`\`
EOF
      ;;
    refactor)
      cat << EOF
Você é um desenvolvedor Senior Fullstack.

Refatore o seguinte código seguindo boas práticas:
$content

Instrução: $extra

Retorne o código refatorado completo com explicações breves dos cambios.
EOF
      ;;
    explain)
      cat << EOF
Explique o seguinte código de forma clara e concisa:

$content

Retorne em formato:
## Resumo
[explicação breve]

## Detalhes
[explicação técnica]

## Dicas
[possíveis melhorias]
EOF
      ;;
    test)
      cat << EOF
 Gere testes unitários para o seguinte código:

$content

Use Vitest/testing-library. Retorne apenas os testes.
EOF
      ;;
    commit)
      cat << EOF
Analise as seguintes alterações git e gere uma mensagem de commit semântica:

$content

UseConventional Commits. Formato: <tipo>(<escopo>): <descrição>

Retorne apenas a mensagem de commit.
EOF
      ;;
    doc)
      cat << EOF
Gere documentação JSDoc/TypeDoc para:

$content

Retorne o códigoコメント com documentação.
EOF
      ;;
    fix)
      cat << EOF
Você é um desenvolvedor Senior. Analise o erro e proponha solução:

Erro: $extra

Código relevante:
$content

Retorne o código corrigido.
EOF
      ;;
    *)
      echo "$content"
      ;;
  esac
}

call_ollama() {
  local prompt="$1"

  ollama run "$MODEL" "$prompt" --max-tokens "$MAX_TOKENS" --temp "$TEMPERATURE" 2>/dev/null
}

cmd_chat() {
  local session_file=".ai/.chat history"
  mkdir -p ".ai"

  echo "🤖 Iniciando chat com $MODEL (Ctrl+C para sair)"
  echo "---"

  ollama run "$MODEL" --temp "$TEMPERATURE"
}

cmd_edit() {
  local file="$1"
  local instruction="$2"

  if [[ -z "$file" || -z "$instruction" ]]; then
    echo "Erro: Arquivo e instrução necessários" >&2
    exit 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "Erro: Arquivo não encontrado: $file" >&2
    exit 1
  fi

  local content
  content=$(cat "$file")
  local prompt
  prompt=$(get_prompt_template "edit" "$content" "$instruction")

  echo "Processando..." >&2
  call_ollama "$prompt"
}

cmd_create() {
  local path="$1"
  local spec="$2"

  if [[ -z "$path" || -z "$spec" ]]; then
    echo "Erro: Caminho e especificação necessários" >&2
    exit 1
  fi

  local prompt
  prompt=$(get_prompt_template "create" "$spec" "")

  call_ollama "$prompt"
}

cmd_refactor() {
  local file="$1"
  local instruction="$2"

  if [[ -z "$file" ]]; then
    echo "Erro: Arquivo necessário" >&2
    exit 1
  fi

  local content
  content=$(cat "$file")
  local prompt
  prompt=$(get_prompt_template "refactor" "$content" "${instruction:-refatore para código limpo}")

  call_ollama "$prompt"
}

cmd_explain() {
  local file="$1"

  if [[ -z "$file" ]]; then
    echo "Erro: Arquivo necessário" >&2
    exit 1
  fi

  local content
  content=$(cat "$file")
  local prompt
  prompt=$(get_prompt_template "explain" "$content" "")

  call_ollama "$prompt"
}

cmd_test() {
  local file="$1"

  if [[ -z "$file" ]]; then
    echo "Erro: Arquivo necessário" >&2
    exit 1
  fi

  local content
  content=$(cat "$file")
  local prompt
  prompt=$(get_prompt_template "test" "$content" "")

  call_ollama "$prompt"
}

cmd_commit() {
  local prompt
  prompt=$(get_prompt_template "commit" "$(git diff --staged 2>/dev/null || echo 'Nenhuma alteração staged')" "")

  call_ollama "$prompt"
}

cmd_doc() {
  local file="$1"

  if [[ -z "$file" ]]; then
    echo "Erro: Arquivo necessário" >&2
    exit 1
  fi

  local content
  content=$(cat "$file")
  local prompt
  prompt=$(get_prompt_template "doc" "$content" "")

  call_ollama "$prompt"
}

cmd_fix() {
  local error="$1"
  local code="${2:-}"

  local prompt
  prompt=$(get_prompt_template "fix" "$code" "$error")

  call_ollama "$prompt"
}

COMMAND=""
FILE=""
TEMP_OVERRIDE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--model)
      MODEL="$2"
      shift 2
      ;;
    -f|--file)
      FILE="$2"
      shift 2
      ;;
    -t|--temp)
      TEMP_OVERRIDE="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    chat|edit|create|refactor|explain|test|commit|doc|fix)
      COMMAND="$1"
      shift
      break
      ;;
    *)
      echo "Comando desconhecido: $1" >&2
      show_help
      exit 1
      ;;
  esac
done

[[ -n "$TEMP_OVERRIDE" ]] && TEMPERATURE="$TEMP_OVERRIDE"

case "$COMMAND" in
  chat)
    cmd_chat
    ;;
  edit)
    cmd_edit "$FILE" "$*"
    ;;
  create)
    local path="$1"
    local spec="${*:2}"
    cmd_create "$path" "$spec"
    ;;
  refactor)
    cmd_refactor "$FILE" "$*"
    ;;
  explain)
    cmd_explain "$FILE"
    ;;
  test)
    cmd_test "$FILE"
    ;;
  commit)
    cmd_commit
    ;;
  doc)
    cmd_explain "$FILE"
    ;;
  fix)
    local error="$1"
    local code="$2"
    cmd_fix "$error" "$code"
    ;;
  *)
    show_help
    ;;
esac