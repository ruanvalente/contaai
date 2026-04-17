'use server';

import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";

export async function getAuthorStats(authorName: string, bookId?: string) {
  const supabase = await getSupabaseAdmin();

  const [followersRes, favoritesRes] = await Promise.all([
    supabase
      .from("author_follow")
      .select("author_name")
      .eq("author_name", authorName),
    bookId
      ? supabase
          .from("user_favorites")
          .select("book_id")
          .eq("book_id", bookId)
      : Promise.resolve({ data: [] }),
  ]);

  const followersCount = followersRes.data?.length || 0;
  const favoritesCount = favoritesRes.data?.length || 0;

  return {
    followersCount,
    favoritesCount,
  };
}

export async function getBookStats(bookId: string) {
  const supabase = await getSupabaseAdmin();

  const { data } = await supabase
    .from("user_favorites")
    .select("book_id")
    .eq("book_id", bookId);

  return {
    favoritesCount: data?.length || 0,
  };
}