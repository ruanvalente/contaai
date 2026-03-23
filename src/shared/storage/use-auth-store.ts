import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (
    provider: "google" | "github",
  ) => Promise<{ error: Error | null }>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      isInitialized: true,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ isLoading: false });
    return { error: error as Error | null };
  },

  signUp: async (email, password) => {
    set({ isLoading: true });
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    set({ isLoading: false });
    return { error: error as Error | null };
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },

  signInWithOAuth: async (provider) => {
    set({ isLoading: true });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    set({ isLoading: false });
    return { error: error as Error | null };
  },
}));
