import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type CookieStore = {
  getAll(): Array<{ name: string; value: string }>;
  setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>): void;
};

export function createServerSupabaseClient(cookieStore: CookieStore) {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookieStore.setAll(cookiesToSet);
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}