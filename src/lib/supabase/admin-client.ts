import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/shared/config/env";

/**
 * Admin Supabase client with SERVICE_ROLE_KEY access.
 *
 * ⚠️ SOMENTE para operações administrativas (ex: repositories).
 * NUNCA importar em componentes client ou rotas públicas.
 * Bypassa RLS — usar com extrema cautela.
 */
export async function getSupabaseAdmin() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components
        }
      },
    },
  });
}
