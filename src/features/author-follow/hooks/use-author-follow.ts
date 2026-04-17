'use client';

import { create } from 'zustand';

interface FollowState {
  followedIds: string[];
  isLoading: boolean;
  follow: (authorId: string) => Promise<{ success: boolean; error?: string }>;
  unfollow: (authorId: string) => Promise<{ success: boolean; error?: string }>;
  isFollowing: (authorId: string) => boolean;
  setFollowedIds: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthorFollowStore = create<FollowState>((set, get) => ({
  followedIds: [],
  isLoading: false,
  follow: async (authorId: string) => {
    set({ isLoading: true });
    try {
      const { followAuthor } = await import('@/features/author-follow/actions/author-follow.actions');
      const result = await followAuthor(authorId);
      if (result.success) {
        set((state) => ({ followedIds: [...state.followedIds, authorId] }));
      }
      return result;
    } finally {
      set({ isLoading: false });
    }
  },
  unfollow: async (authorId: string) => {
    set({ isLoading: true });
    try {
      const { unfollowAuthor } = await import('@/features/author-follow/actions/author-follow.actions');
      const result = await unfollowAuthor(authorId);
      if (result.success) {
        set((state) => ({ followedIds: state.followedIds.filter((id) => id !== authorId) }));
      }
      return result;
    } finally {
      set({ isLoading: false });
    }
  },
  isFollowing: (authorId: string) => get().followedIds.includes(authorId),
  setFollowedIds: (ids: string[]) => set({ followedIds: ids }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));