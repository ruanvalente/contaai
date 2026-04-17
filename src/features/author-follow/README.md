# Author Follow Feature

Sistema para seguir autores e acompanhar suas publicações.

## Estrutura

```
src/features/author-follow/
├── actions/
│   └── author-follow.actions.ts
├── hooks/
│   └── use-author-follow.ts
├── types/
│   └── author.types.ts
├── ui/
│   └── author-card.ui.tsx
├── widgets/
│   └── author-card.widget.tsx
└── README.md
```

## Uso

### Server Actions

```typescript
import { 
  getAuthors, 
  followAuthor, 
  unfollowAuthor, 
  isAuthorFollowed 
} from '@/features/author-follow/actions/author-follow.actions';

// Listar autores
const authors = await getAuthors();

// Seguir autor
await followAuthor(authorId);

// Verificar se segue
const following = await isAuthorFollowed(authorId);
```

### Widget

```typescript
import { AuthorCardWidget } from '@/features/author-follow/widgets/author-card.widget';

<AuthorCardWidget author={author} />
```

## Tipo

```typescript
interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
  age?: number;
  books: AuthorBook[];
}

interface AuthorBook {
  id: string;
  title: string;
  coverColor?: string;
  coverUrl?: string;
}
```