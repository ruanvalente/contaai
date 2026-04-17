'use client';

import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

type FollowState = {
  followedIds: string[];
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  follow: (authorName: string) => Promise<{ success: boolean; error?: string }>;
  unfollow: (authorName: string) => Promise<{ success: boolean; error?: string }>;
  isFollowing: (authorName: string) => boolean;
};

export const useAuthorFollowStore = create<FollowState>((set, get) => ({
  followedIds: [],
  isLoading: false,
  isInitialized: false,
  initialize: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isInitialized: true });
        return;
      }
      const { data, error } = await supabase
        .from("author_follow")
        .select("author_name")
        .eq("user_id", user.id);
      if (!error && data) {
        set({ followedIds: data.map((row) => row.author_name), isInitialized: true });
      }
    } catch (err) {
      console.error("Error initializing author follow:", err);
    } finally {
      set({ isInitialized: true });
    }
  },
  follow: async (authorName: string) => {
    set({ isLoading: true });
    try {
      const { followAuthor } = await import('@/features/author-follow/actions/author-follow.actions');
      const result = await followAuthor(authorName);
      if (result.success) {
        set((state) => ({ followedIds: [...state.followedIds, authorName] }));
      }
      return result;
    } finally {
      set({ isLoading: false });
    }
  },
  unfollow: async (authorName: string) => {
    set({ isLoading: true });
    try {
      const { unfollowAuthor } = await import('@/features/author-follow/actions/author-follow.actions');
      const result = await unfollowAuthor(authorName);
      if (result.success) {
        set((state) => ({ followedIds: state.followedIds.filter((id) => id !== authorName) }));
      }
      return result;
    } finally {
      set({ isLoading: false });
    }
  },
  isFollowing: (authorName: string) => get().followedIds.includes(authorName),
}));