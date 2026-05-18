'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { redirect } from 'next/navigation'

export type RequireAuthResult<T> =
  | { success: true; data: T }
  | { success: false; redirect: string }

export async function requireAuth<T>(
  action: (userId: string) => Promise<T>,
  options?: {
    redirectTo?: string
  }
): Promise<RequireAuthResult<T>> {
  const userId = await getCurrentUserIdOptional()
  
  if (!userId) {
    const redirectUrl = new URL(options?.redirectTo || '/login', process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000')
    
    if (typeof window !== 'undefined') {
      redirectUrl.searchParams.set('redirect', window.location.pathname + window.location.search)
    }
    
    redirect(redirectUrl.toString())
  }
  
  const result = await action(userId)
  return { success: true, data: result }
}

export async function requireAuthOrThrow<T>(
  action: (userId: string) => Promise<T>
): Promise<T> {
  const userId = await getCurrentUserIdOptional()
  
  if (!userId) {
    throw new Error('Usuário não autenticado')
  }
  
  return action(userId)
}
