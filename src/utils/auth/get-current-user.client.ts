import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getCurrentUserIdClient(): Promise<string | null> {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  } catch {
    return null;
  }
}
