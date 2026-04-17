'use client';

import { AuthorCardUI } from '@/features/author-follow/ui/author-card.ui';
import { useAuthorFollowStore } from '@/features/author-follow/hooks/use-author-follow';
import type { AuthorWithBooks } from '@/features/author-follow/actions/author-follow.actions';

interface AuthorCardWidgetProps {
  author: AuthorWithBooks;
}

export function AuthorCardWidget({ author }: AuthorCardWidgetProps) {
  const { follow, unfollow, isFollowing, followedIds } = useAuthorFollowStore();
  const following = isFollowing(author.id);

  return (
    <AuthorCardUI
      author={author}
      isFollowing={following}
      onFollow={async (authorId) => {
        const result = await follow(authorId);
        if (!result.success && result.error) {
          console.error(result.error);
        }
      }}
      onUnfollow={async (authorId) => {
        const result = await unfollow(authorId);
        if (!result.success && result.error) {
          console.error(result.error);
        }
      }}
      followingLoading={followedIds.includes(author.id) ? author.id : null}
    />
  );
}