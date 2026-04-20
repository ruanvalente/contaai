# Notifications Feature

Sistema de notificações Toast usando Sonner.

## Estrutura

```
notifications/
├── actions/            # Server Actions
│   └── notification.actions.ts
├── hooks/             # Hooks cliente
│   └── use-notification.ts
├── types/             # Tipos TypeScript
│   └── notification.types.ts
├── ui/                # Componentes visuais
│   └── toast-provider.ui.tsx
├── widgets/           # Componentes com lógica
│   └── notification-manager.widget.tsx
└── README.md
```

## Uso

### 1. Adicionar Provider no Layout

```tsx
// layout.tsx ou app/layout.tsx
import { NotificationManager } from '@/features/notifications/widgets/notification-manager.widget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <NotificationManager />
      </body>
    </html>
  );
}
```

### 2. Usar Hook em Componentes Cliente

```tsx
'use client'
import { useNotification } from '@/features/notifications/hooks/use-notification';

export function MyComponent() {
  const { success, error, warning, info, promise } = useNotification();
  
  const handleSubmit = async () => {
    promise(fetchData(), {
      loading: 'Enviando dados...',
      success: 'Dados enviados com sucesso',
      error: 'Erro ao enviar dados'
    });
  };

  return <button onClick={handleSubmit}>Enviar</button>;
}
```

### 3. Usar Server Actions

```tsx
// server-action.ts
import { logAction, logPromise } from '@/features/notifications/actions/notification.actions';

export async function saveBook(data: BookData) {
  return logAction({
    action: () => db.book.create(data),
    onSuccess: 'Livro salvo com sucesso',
    onError: 'Erro ao salvar livro',
    context: 'saveBook'
  });
}

// Ou com promise
export async function fetchBooks() {
  return logPromise({
    promise: db.books.findMany(),
    loadingMessage: 'Carregando livros...',
    successMessage: 'Livros carregados',
    errorMessage: 'Erro ao carregar livros'
  });
}
```

### 4. Notificações Diretas (sem Server Action)

```tsx
import { toast } from 'sonner';

toast.success('Operação realizada');
toast.error('Erro occurred');
toast.warning('Aviso');
toast.info('Informação');

// Promise
toast.promise(promise, {
  loading: 'Processando...',
  success: 'Sucesso',
  error: 'Erro'
});
```

## Categorias de Mensagens

Disponível em `NOTIFICATION_MESSAGES`:

- `auth`: signInSuccess, signUpSuccess, signOutSuccess, etc.
- `favorites`: addSuccess, removeSuccess, addError, removeError
- `books`: createSuccess, updateSuccess, deleteSuccess, publishSuccess, etc.
- `reading`: saveProgressSuccess, saveProgressError
- `profile`: updateSuccess, uploadAvatarSuccess, uploadAvatarError
- `upload`: success, error, coverSuccess, coverError
- `search`: noResults, error
- `generic`: error, success, saveError, loadError, deleteError

## Integração com Console

O sistema automaticamente loga no console:
- `console.error` para erros
- `console.warn` para avisos
- `console.log` para sucessos
- `console.info` para informações

Então você pode substituir `console.error(...)` por `logError({ error, context })` nas actions existentes.