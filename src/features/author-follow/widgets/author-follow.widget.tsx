'use client';

import { FollowButtonUI } from '@/shared/ui/follow-button.ui';
import { useAuthorFollowStore } from '@/features/author-follow/hooks/use-author-follow';

type AuthorFollowWidgetProps = {
  authorName: string;
  authorDisplayName?: string;
};

export function AuthorFollowWidget({ authorName, authorDisplayName }: AuthorFollowWidgetProps) {
  const { follow, unfollow, isFollowing, isLoading } = useAuthorFollowStore();
  const following = isFollowing(authorName);

  return (
    <FollowButtonUI
      isFollowing={following}
      isLoading={isLoading}
      onFollow={() => follow(authorName)}
      onUnfollow={() => unfollow(authorName)}
      authorName={authorDisplayName}
    />
  );
}