import { create } from "zustand";
import { Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

type AuthState = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      set({
        session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
        } : null,
        isInitialized: true,
        isLoading: false,
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          } : null,
        });
      });
    } catch (err) {
      console.error("Error initializing auth:", err);
      set({ isInitialized: true, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  setSession: (session) => set({ session }),

  clearAuth: () => set({ user: null, session: null }),
}));

export const useUser = () => {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  return { user, isInitialized, isLoading };
};

export const useRequireAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  return { user, isInitialized, isLoading, isAuthenticated: !!user };
};
