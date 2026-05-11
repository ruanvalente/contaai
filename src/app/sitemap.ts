import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/get-supabase-admin";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://contaai-livid.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseAdmin();

  const { data: books } = await supabase
    .from("unified_books")
    .select("id, created_at")
    .limit(10000);

  const bookUrls: MetadataRoute.Sitemap = (books || []).map((book) => ({
    url: `${BASE_URL}/book/${book.id}`,
    lastModified: new Date(book.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...bookUrls];
}