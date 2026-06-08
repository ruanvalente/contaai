'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { SupabaseAuthorFollowRepository } from '@/server/infrastructure/database/supabase-author-follow.repository'
import { getSupabaseServerClient } from '@/utils/supabase/server'
import type { SessionFollowedAuthor } from '../types/session-library.types'

const authorFollowRepository = new SupabaseAuthorFollowRepository()

export async function getSessionFollowedAuthorsAction(
  sessionId?: string
): Promise<SessionFollowedAuthor[]> {
  try {
    const userId = await getCurrentUserIdOptional()
    const authors = await authorFollowRepository.getFollowedAuthors(userId, sessionId)

    if (authors.length === 0) return []

    return enrichAuthors(authors.map((a) => a.authorName))
  } catch {
    return []
  }
}

async function enrichAuthors(
  authorNames: string[]
): Promise<SessionFollowedAuthor[]> {
  const supabase = await getSupabaseServerClient()
  const lowerNames = authorNames.map((n) => n.toLowerCase())

  const { data: profiles } = await supabase
    .from('profiles')
    .select('name, avatar_url, bio')
    .in('name', authorNames)

  const profileMap = new Map<
    string,
    { avatar_url: string | null; bio: string | null }
  >()
  for (const p of profiles || []) {
    profileMap.set(p.name.toLowerCase(), {
      avatar_url: p.avatar_url,
      bio: p.bio,
    })
  }

  const { data: bookCounts } = await supabase
    .from('user_books')
    .select('author')
    .in('author', authorNames)
    .eq('status', 'published')

  const countMap = new Map<string, number>()
  for (const b of bookCounts || []) {
    const key = b.author.toLowerCase()
    countMap.set(key, (countMap.get(key) || 0) + 1)
  }

  return authorNames.map((name) => {
    const profile = profileMap.get(name.toLowerCase())
    return {
      authorName: name,
      avatarUrl: profile?.avatar_url || null,
      bio: profile?.bio || null,
      booksCount: countMap.get(name.toLowerCase()) || 0,
      followedAt: new Date().toISOString(),
    }
  })
}
