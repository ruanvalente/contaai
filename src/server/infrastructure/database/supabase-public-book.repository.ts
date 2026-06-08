import { IPublicBookRepository, PublicBookListItem, PublicBookDetail, PublicBooksFilters, PublicBooksResult } from "@/server/domain/repositories/public-book.repository";
import { BookCategory } from "@/server/domain/entities/book.entity";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";

const DEFAULT_LIMIT = 20;

export class SupabasePublicBookRepository implements IPublicBookRepository {
  async getPublicBooks(filters: PublicBooksFilters): Promise<PublicBooksResult> {
    let supabase;
    try {
      supabase = await getSupabaseAdmin();
    } catch {
      console.warn("Supabase not available, returning empty results");
      return { books: [], total: 0, page: 1, totalPages: 0 };
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const category = filters?.category;
    const search = filters?.search;

    let query = supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, category, rating, rating_count, page_count",
        { count: "exact" },
      );

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching public books:", error);
    }

    const books: PublicBookListItem[] = (data || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
      pages: book.page_count || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: 0,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return { books, total, page, totalPages };
  }

  async getPublicBookById(id: string): Promise<PublicBookDetail | null> {
    let supabase;
    try {
      supabase = await getSupabaseAdmin();
    } catch {
      console.warn("Supabase not available, returning null");
      return null;
    }

    const { data: book } = await supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at, source",
      )
      .eq("id", id)
      .single();

    if (!book) return null;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      description: book.description || "",
      category: book.category as BookCategory,
      pages: book.pages || 0,
      rating: book.rating || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: book.review_count || 0,
      createdAt: new Date(book.created_at),
    };
  }

  async getFeaturedPublicBooks(limit: number = 10): Promise<PublicBookListItem[]> {
    let supabase;
    try {
      supabase = await getSupabaseAdmin();
    } catch {
      console.warn("Supabase not available, returning empty results");
      return [];
    }

    const { data } = await supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, category, rating, page_count, rating_count",
      )
      .order("rating", { ascending: false })
      .limit(limit);

    return (data || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
      pages: book.page_count || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: 0,
    }));
  }

  async searchPublicBooks(query: string): Promise<PublicBookListItem[]> {
    if (!query || query.trim().length === 0) return [];

    let supabase;
    try {
      supabase = await getSupabaseAdmin();
    } catch {
      console.warn("Supabase not available, returning empty results");
      return [];
    }

    const { data } = await supabase
      .from("unified_books")
      .select(
        "id, title, author, cover_url, cover_color, category, rating, rating_count, page_count",
      )
      .or(
        `title.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`,
      )
      .limit(20);

    return (data || []).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url || undefined,
      coverColor: book.cover_color || "#8B4513",
      category: book.category as BookCategory,
      rating: book.rating || 0,
      pages: book.page_count || 0,
      ratingCount: book.rating_count || 0,
      reviewCount: 0,
    }));
  }
}
