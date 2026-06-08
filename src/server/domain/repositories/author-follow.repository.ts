export type FollowedAuthor = {
  authorName: string
  createdAt?: string
}

export interface IAuthorFollowRepository {
  follow(authorName: string, userId?: string, sessionId?: string): Promise<boolean>
  unfollow(authorName: string, userId?: string, sessionId?: string): Promise<boolean>
  getFollowedAuthors(userId?: string, sessionId?: string): Promise<FollowedAuthor[]>
  countFollowers(authorName: string): Promise<number>
  countPublishedBooks(authorName: string): Promise<number>
  clearSession(sessionId: string): Promise<boolean>
}

export type AuthorStats = {
  followersCount: number
  favoritesCount: number
}
