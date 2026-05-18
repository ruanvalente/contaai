'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'

export type UserRole = 'reader' | 'author'

export async function getUserRole(): Promise<UserRole | null> {
  const userId = await getCurrentUserIdOptional()

  if (!userId) return null

  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  })

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

  if (count && count > 0) return 'author'

  return 'reader'
}
