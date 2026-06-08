'use server'

import { cache } from 'react'
import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { SupabaseUserRepository } from '@/server/infrastructure/database/supabase-user.repository'
import type { UserRole } from '@/server/domain/repositories/user.repository'

const userRepository = new SupabaseUserRepository()

export const getUserRole = cache(async (): Promise<UserRole | null> => {
  const userId = await getCurrentUserIdOptional()
  if (!userId) return null
  return userRepository.getRole(userId)
})
