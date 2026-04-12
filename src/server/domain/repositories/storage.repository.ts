export interface IStorageRepository {
  uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }>;
  deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }>;
}