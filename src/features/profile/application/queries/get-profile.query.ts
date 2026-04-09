'use server';

import { cache } from 'react';
import { getSupabaseServerClient } from '@/utils/supabase/server';

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    const profileData = profile || {
      id: user.id,
      name: fallbackName,
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const finalProfile = { ...profileData };
    if (profile && !profile.name && fallbackName) {
      finalProfile.name = fallbackName;
    }

    return {
      id: profileData.id,
      name: profileData.name,
      email: user.email || '',
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    };
  } catch (err) {
    console.error('Error in getProfile:', err);
    return null;
  }
});