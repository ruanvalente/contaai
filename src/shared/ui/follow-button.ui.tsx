import { cn } from '@/utils/cn';
import { Button } from './button.ui';

interface FollowButtonUIProps {
  isFollowing: boolean;
  isLoading: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  authorName?: string;
  className?: string;
}

export function FollowButtonUI({
  isFollowing,
  isLoading,
  onFollow,
  onUnfollow,
  authorName,
  className,
}: FollowButtonUIProps) {
  const handleClick = isFollowing ? onUnfollow : onFollow;

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      className={cn('w-full py-2.5 text-sm', className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading 
        ? (isFollowing ? 'Removendo...' : 'Seguindo...')
        : (isFollowing 
          ? `✓ Seguindo ${authorName ? `"${authorName}"` : 'Autor'}` 
          : `+ Seguir ${authorName ? `"${authorName}"` : 'Autor'}`)}
    </Button>
  );
}