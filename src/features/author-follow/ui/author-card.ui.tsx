import { cn } from '@/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar.ui';
import type { AuthorWithBooks } from '@/features/author-follow/actions/author-follow.actions';

interface AuthorCardUIProps {
  author: AuthorWithBooks;
  isFollowing: boolean;
  onFollow: (authorId: string) => void;
  onUnfollow: (authorId: string) => void;
  followingLoading?: string | null;
  className?: string;
}

export function AuthorCardUI({
  author,
  isFollowing,
  onFollow,
  onUnfollow,
  followingLoading,
  className,
}: AuthorCardUIProps) {
  const isLoading = followingLoading === author.id;

  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold">{author.name}</h3>
            {author.age && (
              <p className="text-sm text-muted-foreground">{author.age} anos</p>
            )}
          </div>

          {author.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {author.description}
            </p>
          )}
        </div>
      </div>

      {author.books.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Livros ({author.books.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {author.books.map((book) => (
              <span
                key={book.id}
                className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: book.coverColor || '#666' }}
              >
                {book.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        {isFollowing ? (
          <button
            onClick={() => onUnfollow(author.id)}
            disabled={isLoading}
            className="w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80 disabled:opacity-50"
          >
            {isLoading ? 'Removendo...' : 'Seguindo'}
          </button>
        ) : (
          <button
            onClick={() => onFollow(author.id)}
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Seguindo...' : 'Seguir'}
          </button>
        )}
      </div>
    </div>
  );
}