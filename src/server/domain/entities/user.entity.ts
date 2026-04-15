export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserInput = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
};

export type UserResult = 
  | { success: true; user: User }
  | { success: false; error: string };