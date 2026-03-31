# Accessibility Specification

## Description
Este documento define as melhores práticas de acessibilidade (WCAG 2.2) para a aplicação Conta.AI.

## Baseado em
- Accessibility Compliance Skill (`.agents/skills/accessibility-compliance/`)

---

## 1. Princípios WCAG

### 1.1 Os 4 Princípios (POUR)

| Princípio | Descrição |
|-----------|-----------|
| **Perceptível** | Informações apresentadas de forma que usuários possam perceber |
| **Operável** | Interface navegável e operável por todos os usuários |
| **Compreensível** | Informações e operação compreensíveis |
| **Robusto** | Conteúdo interpretado por variety de user agents |

---

## 2. Estrutura Semântica

### 2.1 Headings

```tsx
// ✅ Hierarquia correta
function Page() {
  return (
    <main>
      <h1>Título Principal</h1>
      <section>
        <h2>Seção</h2>
        <h3>Subseção</h3>
      </section>
    </main>
  );
}

// ❌ Pular níveis ou duplicar h1
function BadPage() {
  return (
    <div>
      <h1>Título</h1>
      <h3>Outro título</h3> {/* Pula h2! */}
    </div>
  );
}
```

### 2.2 Landmarks

```tsx
// ✅ Usar landmarks semânticos
function Layout() {
  return (
    <>
      <header>
        <nav aria-label="Main navigation">...</nav>
      </header>
      <main>
        <article>
          <aside>...</aside>
        </article>
      </main>
      <footer>...</footer>
    </>
  );
}
```

### 2.3 Listas

```tsx
// ✅ Listas semânticas
function BookList({ books }) {
  return (
    <ul role="list">
      {books.map(book => (
        <li key={book.id}>
          <article>{book.title}</article>
        </li>
      ))}
    </ul>
  );
}
```

---

## 3. Formulários

### 3.1 Labels

```tsx
// ✅ Label associada corretamente
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// ✅ ou com aria-label
<input 
  type="email" 
  name="email" 
  aria-label="Email address" 
/>

// ❌ Sem label
<input type="email" name="email" />
```

### 3.2 Error Messages

```tsx
// ✅ Erros acessíveis
<form>
  <div>
    <label htmlFor="password">Password</label>
    <input 
      id="password" 
      type="password"
      aria-invalid="true"
      aria-describedby="password-error"
    />
    <span id="password-error" role="alert" className="error">
      Password must be at least 8 characters
    </span>
  </div>
</form>
```

### 3.3 Required Fields

```tsx
// ✅ Campo obrigatório
<label htmlFor="name">
  Name
  <span aria-hidden="true">*</span>
</label>
<input 
  id="name" 
  required 
  aria-required="true" 
/>
```

---

## 4. Navegação

### 4.1 Skip Links

```tsx
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header>...</header>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}

// styles.css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

### 4.2 Focus Visible

```tsx
// ✅ Foco visível
:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

// ❌ Remover outline sem alternativa
:focus {
  outline: none;
}
```

### 4.3 Tab Order

```tsx
// ✅ Ordem lógica de tab
<div>
  <button>1</button>
  <button>2</button>
  <button>3</button>
</div>

// ⚠️ Cuidado com tabindex
// Evitar tabindex > 0
<div tabindex="5">...</div> {/* Evitar! */}
```

---

## 5. Imagens

### 5.1 Alt Text

```tsx
// ✅ Imagem decorativa
<img src="decorative.png" alt="" />

// ✅ Imagem informativa
<img 
  src="book-cover.jpg" 
  alt="Capa do livro O Pequeno Príncipe" 
/>

// ❌ Sem alt ou texto redundante
<img src="book.jpg" alt="Livro" />
<img src="photo.jpg" /> {/* Sem alt! */}
```

### 5.2 Figcaption

```tsx
<figure>
  <img src="chart.png" alt="Gráfico de vendas 2024" />
  <figcaption>
    Vendas cresceram 25% no primeiro trimestre
  </figcaption>
</figure>
```

---

## 6. Cores e Contraste

### 6.1 Contraste

| Nível WCAG | Ratio mínimo | Texto |
|------------|-------------|-------|
| AA | 4.5:1 | Normal |
| AA | 3:1 | Grande (18pt+ ou 14pt bold) |
| AAA | 7:1 | Normal |
| AAA | 4.5:1 | Grande |

```tsx
// ✅ Contraste suficiente
.text-primary {
  color: #1a1a2e; /* Contraste 15:1 em white */
}

// Verificar em: https://webaim.org/resources/contrastchecker/
```

### 6.2 Não Confiar Apenas em Cores

```tsx
// ❌ Apenas cor para indicar estado
<span className="status success">Completed</span>

// ✅ Cor + ícone + texto
<span className="status success">
  <CheckIcon aria-hidden="true" />
  <span>Completed</span>
</span>

// ✅ ou com aria
<span 
  role="status" 
  aria-label="Status: Completed"
  className="status success"
/>
```

---

## 7.ARIA

### 7.1 Quando Usar ARIA

```tsx
// ✅ States e propriedades dinâmicas
<button 
  aria-expanded="false" 
  aria-controls="menu"
>
  Menu
</button>
<div id="menu" hidden>...</div>

// ✅ Live regions para conteúdo dinâmico
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### 7.2 ARIA Labels

```tsx
// ✅ Label específico para botão sem texto
<button aria-label="Fechar modal">
  <XIcon />
</button>

// ✅ Descrever ação
<button aria-label="Adicionar aos favoritos">
  <HeartIcon />
</button>
```

### 7.3 aria-hidden

```tsx
// ✅ Ícones decorativos
<button>
  <SearchIcon aria-hidden="true" />
  <span>Buscar</span>
</button>
```

---

## 8. Testing

### 8.1 Keyboard Testing

```
Tab - navegar para frente
Shift+Tab - navegar para trás
Enter - ativar
Space - toggle
Esc - fechar
Setas - navegar em menus
```

### 8.2 Ferramentas

| Ferramenta | Uso |
|-----------|-----|
| axe DevTools | Auditoria automática |
| WAVE | Erros e alertas |
| NVDA | Screen reader (Windows) |
| VoiceOver | Screen reader (Mac) |
| Lighthouse | Relatório de accessibility |

---

## 9. Checklist

### 9.1 Estrutura

- [ ] Hierarquia de headings lógica (h1 → h2 → h3)
- [ ] Landmarks semânticos (main, nav, header, footer)
- [ ] Skip link para conteúdo principal

### 9.2 Formulários

- [ ] Labels associadas aos inputs
- [ ] Erros descritos com aria-invalid e aria-describedby
- [ ] Campos obrigatórios com aria-required

### 9.3 Navegação

- [ ] Foco sempre visível
- [ ] Ordem de tab lógica
- [ ] Skip links funcionais

### 9.4 Mídia

- [ ] Alt text em todas as imagens
- [ ] Captions em vídeos
- [ ] Áudio com transcrição

### 9.5 Cores

- [ ] Contraste mínimo 4.5:1 (AA)
- [ ] Não confiar apenas em cores
- [ ] Modo escuro suportado

### 9.6 Interatividade

- [ ] Todos os functionamentos por teclado
- [ ] Estados de foco visíveis
- [ ] Timeouts configuráveis

---

## Acceptance Criteria

- [ ] Teste com keyboard-only navigation
- [ ] Teste com screen reader (NVDA/VoiceOver)
- [ ] Contraste verificado (4.5:1 mínimo)
- [ ] Alt text em todas as imagens
- [ ] Labels em todos os formulários
- [ ] Hierarquia de headings correta
- [ ] Foco visível em todos os estados
- [ ]ARIA usado corretamente
- [ ] Landmarks semânticos
- [ ] Skip links implementados
