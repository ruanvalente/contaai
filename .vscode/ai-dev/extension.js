const vscode = require('vscode');
const { spawn } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');

const config = vscode.workspace.getConfiguration('aiDev');
const MODEL = config.get('model', 'deepseek-coder:latest');
const TEMP = config.get('temperature', 0.7);
const MAX_TOKENS = config.get('maxTokens', 4096);

function runOllama(prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ollama', ['run', MODEL, prompt, '--max-tokens', String(MAX_TOKENS), '--temp', String(TEMP)]);
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { vscode.window.appendText(data.toString()); });
    proc.on('close', (code) => code === 0 ? resolve(output) : reject(new Error(`Exit: ${code}`)));
    proc.on('error', reject);
  });
}

async function explainFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return vscode.window.showErrorMessage('No file open');
  const code = editor.document.getText(editor.selection);
  const prompt = `Explain this code:\n\`\`\`\${code}\`\`\``;
  const result = await runOllama(prompt);
  vscode.window.showInformationMessage(result);
}

async function refactorFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return vscode.window.showErrorMessage('No file open');
  const code = editor.document.getText(editor.selection);
  const prompt = `Refactor this code following best practices:\n\`\`\`${code}\`\`\``;
  const result = await runOllama(prompt);
  vscode.window.showInformationMessage(result);
}

async function generateTests() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return vscode.window.showErrorMessage('No file open');
  const code = editor.document.getText(editor.selection);
  const prompt = `Generate Vitest tests:\n\`\`\`${code}\`\`\``;
  const result = await runOllama(prompt);
  vscode.window.showInformationMessage(result);
}

async function fixBug() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return vscode.window.showErrorMessage('No file open');
  const code = editor.document.getText(editor.selection);
  const prompt = `Fix bugs in:\n\`\`\`${code}\`\`\``;
  const result = await runOllama(prompt);
  vscode.window.showInformationMessage(result);
}

async function generateCommit() {
  const terminal = vscode.window.createTerminal('AI Commit');
  terminal.sendText('bun run ai commit');
  terminal.show();
}

async function chat() {
  const terminal = vscode.window.createTerminal('AI Chat');
  terminal.sendText('bun run ai chat');
  terminal.show();
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('ai.explainFile', explainFile),
    vscode.commands.registerCommand('ai.refactorFile', refactorFile),
    vscode.commands.registerCommand('ai.generateTests', generateTests),
    vscode.commands.registerCommand('ai.fixBug', fixBug),
    vscode.commands.registerCommand('ai.generateCommit', generateCommit),
    vscode.commands.registerCommand('ai.chat', chat)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };