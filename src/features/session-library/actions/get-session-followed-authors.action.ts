'use server'

import { getCurrentUserIdOptional } from '@/utils/auth/get-current-user.server'
import { getSupabaseServerClient } from '@/utils/supabase/server'
import type { SessionFollowedAuthor } from '../types/session-library.types'

export async function getSessionFollowedAuthorsAction(
  sessionId?: string
): Promise<SessionFollowedAuthor[]> {
  try {
    const userId = await getCurrentUserIdOptional()
    const supabase = await getSupabaseServerClient()

    let authorNames: string[] = []

    if (userId) {
      const { data, error } = await supabase
        .from('author_follow')
        .select('author_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) return []
      authorNames = data?.map((r) => r.author_name) || []
    } else if (sessionId) {
      const { data, error } = await supabase
        .from('author_follow')
        .select('author_name, created_at')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .order('created_at', { ascending: false })

      if (error) return []
      authorNames = data?.map((r) => r.author_name) || []
    }

    if (authorNames.length === 0) return []

    return enrichAuthors(supabase, authorNames)
  } catch {
    return []
  }
}

async function enrichAuthors(
  supabase: any,
  authorNames: string[]
): Promise<SessionFollowedAuthor[]> {
  // Fetch profile data for all authors in one query
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

  // Fetch book counts for all authors in one query
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
