import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}
