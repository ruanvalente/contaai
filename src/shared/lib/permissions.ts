export type Action =
  | 'view:books'
  | 'view:session'
  | 'read:published'
  | 'search:books'
  | 'follow:author'
  | 'rate:book'
  | 'favorite:book'
  | 'library:personal'
  | 'download:book'
  | 'create:book'
  | 'edit:book'

export type UserRole = 'anonymous' | 'reader' | 'author'

const PERMISSIONS: Record<UserRole, Set<Action>> = {
  anonymous: new Set([
    'view:books',
    'view:session',
    'read:published',
    'search:books',
    'follow:author',
    'rate:book',
    'favorite:book',
  ]),
  reader: new Set([
    'view:books',
    'view:session',
    'read:published',
    'search:books',
    'follow:author',
    'rate:book',
    'favorite:book',
    'library:personal',
    'download:book',
  ]),
  author: new Set([
    'view:books',
    'view:session',
    'read:published',
    'search:books',
    'follow:author',
    'rate:book',
    'favorite:book',
    'library:personal',
    'download:book',
    'create:book',
    'edit:book',
  ]),
}

export function can(role: UserRole, action: Action): boolean {
  return PERMISSIONS[role]?.has(action) ?? false
}

export function isLazyAction(action: Action): boolean {
  return action === 'follow:author' || action === 'rate:book' || action === 'favorite:book'
}

export function getAnonymousToastMessage(action: Action): string {
  const messages: Record<string, string> = {
    'follow:author': 'Você está seguindo este autor! Faça login para gerenciar suas conexões.',
    'rate:book': 'Avaliação salva! Faça login para sincronizar com sua conta.',
    'favorite:book': 'Livro favoritado! Faça login para acessar em outros dispositivos.',
  }
  return messages[action] || 'Ação salva! Faça login para mais recursos.'
}
