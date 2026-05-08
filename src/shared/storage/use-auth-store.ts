import { create } from "zustand";
import { Session, SupabaseClient } from "@supabase/supabase-js";

export type UserRole = 'reader' | 'author'

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: UserRole;
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

let authListenerCleanup: (() => void) | null = null

async function fetchUserRole(supabase: SupabaseClient, userId: string): Promise<UserRole> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.role) return profile.role as UserRole

  const { count } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published')

  return count && count > 0 ? 'author' : 'reader'
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });

    if (authListenerCleanup) {
      authListenerCleanup()
    }

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role: UserRole | undefined

      if (user) {
        role = await fetchUserRole(supabase, user.id)
      }

      set({
        session: null,
        user: user ? {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          role,
        } : null,
        isInitialized: true,
        isLoading: false,
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ isLoading: true });

        if (session?.user) {
          const role = await fetchUserRole(supabase, session.user.id)

          set({
            session,
            user: {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
              role,
            },
            isLoading: false,
          });
        } else {
          set({ session: null, user: null, isLoading: false });
        }
      });

      authListenerCleanup = () => subscription.unsubscribe()
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
