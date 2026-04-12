#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { cwd } from 'process';

const MODEL = process.env.OLLAMA_MODEL || 'deepseek-coder:latest';
const MAX_TOKENS = parseInt(process.env.OLLAMA_MAX_TOKENS || '4096');
const TEMPERATURE = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7');

const commands = {
  chat: 'Inicia sessão de chat interativo',
  edit: 'Edita arquivo com instruções',
  create: 'Cria novo arquivo',
  refactor: 'Refatora código',
  explain: 'Explica o código',
  test: 'Gera testes',
  commit: 'Gera mensagem de commit',
  bug: 'Analisa e corrige erro',
  find: 'Encontra código relevante',
};

const templates = {
  edit: (content, instruction) => `You are a Senior Fullstack Developer (Next.js 16, TypeScript, React 19, Tailwind CSS 4, Zustand, Supabase).

Analyze and edit this code:
\`\`\`typescript
${content}
\`\`\`

Instruction: ${instruction}

Return only the modified code in a code block:`,

  create: (spec) => `You are a Senior Fullstack Developer (Next.js 16, TypeScript, React 19, Tailwind CSS 4, Zustand, Supabase).

Create code according to this specification:
${spec}

Return only the code in a code block:`,

  refactor: (content, instruction) => `You are a Senior Fullstack Developer.

Refactor this code following best practices:
\`\`\`typescript
${content}
\`\`\`

Instruction: ${instruction}

Return the refactored code with brief explanation:`,

  explain: (content) => `Explain this code clearly:

\`\`\`typescript
${content}
\`\`\`

Return in format:
## Summary
[brief explanation]

## Details
[technical details]`,

  test: (content) => `Generate unit tests using Vitest:

\`\`\`typescript
${content}
\`\`\`

Return only test code:`,

  commit: (diff) => `Analyze git diff and generate semantic commit message.

Diff:
\`\`\`diff
${diff}
\`\`\`

Use Conventional Commits format: <type>(<scope>): <description>

Return only the commit message:`,

  bug: (error, code) => `Fix this bug:

Error: ${error}

Code:
\`\`\`typescript
${code}
\`\`\`

Return fixed code:`,

  find: (query) => `Search codebase for: "${query}"

Return file paths and relevant code snippets found:`,
};

function runOllama(prompt) {
  return new Promise((resolve, reject) => {
    const args = ['run', MODEL, prompt];
    let output = '';

    const proc = spawn('ollama', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, OLLAMA_TEMPERATURE: String(TEMPERATURE) },
    });

    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { process.stderr.write(data); });

    proc.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Ollama exited with code ${code}`));
    });

    proc.on('error', reject);
  });
}

function readFile(path) {
  return readFileSync(path, 'utf-8');
}

async function getGitDiff() {
  try {
    const { execSync } = await import('child_process');
    return execSync('git diff --staged', { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

function walkDir(dir, files = []) {
  try {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const stat = statSync(path);
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist' && entry !== 'build') {
        walkDir(path, files);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry)) {
        files.push(path);
      }
    }
  } catch {}
  return files;
}

async function cmdChat() {
  console.log(`🤖 Chat com ${MODEL} (Ctrl+C para sair)\n---`);
  spawn('ollama', ['run', MODEL], { 
    stdio: 'inherit',
    env: { ...process.env, OLLAMA_TEMPERATURE: String(TEMPERATURE) }
  });
}

async function cmdEdit(file, instruction) {
  if (!file || !instruction) {
    console.error('Uso: ai edit -f <arquivo> "<instrução>"');
    process.exit(1);
  }
  const content = readFile(resolve(cwd(), file));
  const prompt = templates.edit(content, instruction);
  console.log(await runOllama(prompt));
}

async function cmdCreate(path, spec) {
  if (!path || !spec) {
    console.error('Uso: ai create <caminho> "<especificação>"');
    process.exit(1);
  }
  const prompt = templates.create(spec);
  console.log(await runOllama(prompt));
}

async function cmdRefactor(file, instruction) {
  if (!file) {
    console.error('Uso: ai refactor -f <arquivo> [instrução]');
    process.exit(1);
  }
  const content = readFile(resolve(cwd(), file));
  const prompt = templates.refactor(content, instruction || 'refatore para código limpo');
  console.log(await runOllama(prompt));
}

async function cmdExplain(file) {
  if (!file) {
    console.error('Uso: ai explain <arquivo>');
    process.exit(1);
  }
  const content = readFile(resolve(cwd(), file));
  const prompt = templates.explain(content);
  console.log(await runOllama(prompt));
}

async function cmdTest(file) {
  if (!file) {
    console.error('Uso: ai test <arquivo>');
    process.exit(1);
  }
  const content = readFile(resolve(cwd(), file));
  const prompt = templates.test(content);
  console.log(await runOllama(prompt));
}

async function cmdCommit() {
  const diff = getGitDiff() || 'Nenhuma alteração staged';
  const prompt = templates.commit(diff);
  console.log(await runOllama(prompt));
}

async function cmdBug(error, file) {
  if (!error) {
    console.error('Uso: ai bug "<erro>" [arquivo]');
    process.exit(1);
  }
  const code = file ? readFile(resolve(cwd(), file)) : '';
  const prompt = templates.bug(error, code);
  console.log(await runOllama(prompt));
}

async function cmdFind(query) {
  if (!query) {
    console.error('Uso: ai find "<busca>"');
    process.exit(1);
  }
  const files = walkDir(cwd()).slice(0, 20);
  let content = `Searching for: "${query}"\n\nFiles found:\n`;
  for (const f of files) {
    try {
      const c = readFile(f);
      if (c.toLowerCase().includes(query.toLowerCase())) {
        content += `\n--- ${f} ---\n${c.slice(0, 500)}\n`;
      }
    } catch {}
  }
  const prompt = templates.find(query) + '\n\nContext:\n' + content.slice(0, 3000);
  console.log(await runOllama(prompt));
}

function showHelp() {
  console.log(`
🤖 AI CLI - Assistente de desenvolvimento local (Ollama)

Usage: ai <comando> [opções]

Comandos:
  chat          Chat interativo
  edit         Edita arquivo (-f <file> "<instrução>")
  create      Cria arquivo (<path> "<spec>")
  refactor    Refatora código (-f <file> [instrução])
  explain     Explica código
  test        Gera testes
  commit      Gera commit git
  bug         Corrige erro/bug ("<erro>" [file])
  find        Busca no código

Opções:
  -f, --file <path>  Arquivo para editar/explicar
  -m, --model       Modelo (padrão: deepseek-coder:latest)
  -h, --help        Ajuda

Exemplos:
  ai chat
  ai edit -f src/app/page.tsx "adicione um botão de login"
  ai explain src/utils/auth.ts
  ai commit
  ai bug "Cannot read property 'id' of undefined"
`);
}

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '-h' || cmd === '--help') {
  showHelp();
  process.exit(0);
}

const flags = {};
let i = 1;
while (i < args.length) {
  if (args[i] === '-f' || args[i] === '--file') {
    flags.file = args[i + 1];
    i += 2;
  } else if (args[i] === '-m' || args[i] === '--model') {
    flags.model = args[i + 1];
    i += 2;
  } else if (args[i]?.startsWith('-')) {
    i++;
  } else {
    break;
  }
}

const remaining = args.slice(i);

(async () => {
  try {
    switch (cmd) {
      case 'chat': await cmdChat(); break;
      case 'edit': await cmdEdit(flags.file, remaining.join(' ')); break;
      case 'create': await cmdCreate(remaining[0], remaining.slice(1).join(' ')); break;
      case 'refactor': await cmdRefactor(flags.file, remaining.join(' ')); break;
      case 'explain': await cmdExplain(remaining[0] || flags.file); break;
      case 'test': await cmdTest(remaining[0] || flags.file); break;
      case 'commit': await cmdCommit(); break;
      case 'bug': await cmdBug(remaining[0], remaining[1]); break;
      case 'find': await cmdFind(remaining.join(' ')); break;
      default:
        console.error(`Comando desconhecido: ${cmd}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
})();