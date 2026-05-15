import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetCurrentUserId = vi.fn()

vi.mock('@/utils/auth/get-current-user.server', () => ({
  getCurrentUserId: (...args: any[]) => mockGetCurrentUserId(...args)
}))

const mockSupabaseRpc = vi.fn()
const mockSupabaseClient = {
  rpc: mockSupabaseRpc,
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockSupabaseClient,
}))

vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

import { migrateSessionDataAction, type MigrationResult } from '../migrate-session-data.action'

describe('migrateSessionDataAction', () => {
  const sessionId = 'test-session-abc'

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockSupabaseRpc.mockImplementation((rpcName: string) => {
      if (rpcName === 'migrate_session_follows') return Promise.resolve({ data: 3, error: null })
      if (rpcName === 'migrate_session_ratings') return Promise.resolve({ data: 2, error: null })
      if (rpcName === 'migrate_session_favorites') return Promise.resolve({ data: 5, error: null })
      return Promise.resolve({ data: null, error: new Error('Unknown RPC') })
    })
  })

  it('returns success with migrated counts when all RPCs succeed', async () => {
    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(true)
    expect(result.migrated).toEqual({ follows: 3, ratings: 2, favorites: 5 })
    expect(result.error).toBeUndefined()
  })

  it('calls all three RPCs with correct parameters', async () => {
    await migrateSessionDataAction(sessionId)

    expect(mockSupabaseRpc).toHaveBeenCalledWith('migrate_session_follows', {
      p_session_id: sessionId,
      p_user_id: 'user-123',
    })
    expect(mockSupabaseRpc).toHaveBeenCalledWith('migrate_session_ratings', {
      p_session_id: sessionId,
      p_user_id: 'user-123',
    })
    expect(mockSupabaseRpc).toHaveBeenCalledWith('migrate_session_favorites', {
      p_session_id: sessionId,
      p_user_id: 'user-123',
    })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetCurrentUserId.mockResolvedValue(null)

    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Usuário não autenticado')
    expect(result.migrated).toEqual({ follows: 0, ratings: 0, favorites: 0 })
  })

  it('handles null data from RPCs gracefully', async () => {
    mockSupabaseRpc.mockResolvedValue({ data: null, error: null })

    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(true)
    expect(result.migrated).toEqual({ follows: 0, ratings: 0, favorites: 0 })
  })

  it('handles partial RPC results', async () => {
    mockSupabaseRpc.mockImplementation((rpcName: string) => {
      if (rpcName === 'migrate_session_follows') return Promise.resolve({ data: 10, error: null })
      if (rpcName === 'migrate_session_ratings') return Promise.resolve({ data: null, error: null })
      if (rpcName === 'migrate_session_favorites') return Promise.resolve({ data: 0, error: null })
      return Promise.resolve({ data: null, error: null })
    })

    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(true)
    expect(result.migrated).toEqual({ follows: 10, ratings: 0, favorites: 0 })
  })

  it('catches thrown errors and returns error result', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetCurrentUserId.mockRejectedValue(new Error('Network error'))

    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Erro ao migrar dados da sessão')
    expect(result.migrated).toEqual({ follows: 0, ratings: 0, favorites: 0 })
    consoleSpy.mockRestore()
  })

  it('catches supabase configuration errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetCurrentUserId.mockImplementationOnce(async () => {
      throw new Error('Supabase configuration missing')
    })

    const result = await migrateSessionDataAction(sessionId)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Erro ao migrar dados da sessão')
    consoleSpy.mockRestore()
  })
})
