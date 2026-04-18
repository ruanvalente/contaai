# /generate-readme

## Descrição
Analisa a estrutura atual do projeto e gera automaticamente um README.md completo, alinhado com arquitetura, padrões e propósito da aplicação.

## Como Usar

```
/generate-readme
```

Opcional (mais avançado)

```
/generate-readme --focus=frontend
/generate-readme --focus=backend
/generate-readme --focus=fullstack
```

## Objetivo

Gerar um README que:

- Explique o projeto rapidamente (sem enrolação)
- Mostre a arquitetura real (não fictícia)
- Ajude onboarding de devs
- Sirva como documentação viva
- Documente as deciçõe da base de dados quando houver (supabase)

## O que o comando analisa

1. Estrutura de pastas

- features/
- ui/
- widgets/
- services / useCases / server
- hooks / composables / actions
- shared/
- utils
- store

2. Tecnologias utilizadas

- Framework (Next, React, Vue, Nuxt, Angular, etc.)
- Linguagem (TS/TSX/JS/VUE)
- Testes (Vitest, Jest)
- Estilização (Tailwind, CSS Modules)

3. Padrões arquiteturais

- Feature-based structure
- Separação de responsabilidades
- Uso de composables/hooks
- Camadas (UI / domain / infra)

4. Scripts do projeto
- dev
- build
- test
- lint

## Output

Gera um arquivo README.md com a seguinte estrutura:

# 📌 Nome do Projeto

Breve descrição clara do projeto (1–2 frases).

---

## 🚀 Tecnologias

* Vue / Nuxt / React / Next
* TypeScript
* TailwindCSS
* Vitest / Jest

---

## 🧱 Arquitetura

O projeto segue uma arquitetura **feature-based**, com separação clara de responsabilidades:

```
features/
  book/
    components/
    widgets/
    hooks/
    services/

shared/
  components/
  utils/
```

### Camadas

* **UI** → componentes visuais
* **Hooks/Composables** → lógica reutilizável
* **Services / UseCases** → regras de negócio
* **Widgets** → composição de features

---

## 📂 Estrutura do Projeto

Explicação resumida das principais pastas.

---

## ⚙️ Setup

```bash
# instalar dependências
npm install

# rodar projeto
npm run dev
```

---

## 🧪 Testes

```bash
npm run test
```

---

## 📏 Padrões e Convenções

* Feature-based structure
* Componentes desacoplados
* SRP (Single Responsibility Principle)
* Naming consistente

---

## 🔍 Scripts Disponíveis

* `dev` → ambiente local
* `build` → build de produção
* `test` → testes
* `lint` → padronização de código

---

## 🧠 Decisões Arquiteturais

Breve explicação de:

* Por que usar feature-based
* Por que separar widgets/components
* Estratégia de escalabilidade

---

## 📈 Melhorias Futuras

* [ ] Melhorar cobertura de testes
* [ ] Otimização de performance
* [ ] Refatoração de features grandes

---

## 🤝 Contribuição

1. Criar branch
2. Commitar mudanças
3. Abrir PR

---

## 📄 Licença

Definir licença do projeto
