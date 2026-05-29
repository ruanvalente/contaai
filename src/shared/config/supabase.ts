import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * @deprecated Use `@/utils/supabase/client` (browser) or `@/utils/supabase/server` (server) instead.
 * This client does NOT use the SSR-compatible `@supabase/ssr` package and should not be used
 * in production code paths.
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** @deprecated Use `@/utils/supabase/client` or `@/utils/supabase/server` instead. */
export function createSupabaseClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
