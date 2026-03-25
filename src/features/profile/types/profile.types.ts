export type Profile = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateProfileInput = {
  name?: string;
  bio?: string;
  avatar_url?: string;
};

export type ProfileResult = 
  | { success: true; profile: Profile }
  | { success: false; error: string };

export type UploadResult = 
  | { success: true; url: string }
  | { success: false; error: string };
