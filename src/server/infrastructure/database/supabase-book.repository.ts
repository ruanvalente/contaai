import { IBookRepository } from "@/server/domain/repositories/book.repository";
import { Book, BookCategory } from "@/server/domain/entities/book.entity";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import { mapToBookEntity } from "../mappers/book.mapper";

export class SupabaseBookRepository implements IBookRepository {
  async getAll(category?: BookCategory, search?: string): Promise<Book[]> {
    const supabase = await getSupabaseAdmin();
    
    let query = supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching books:", error);
      return [];
    }

    return (data || []).map(mapToBookEntity);
  }

  async getById(id: string): Promise<Book | null> {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching book:", error);
      return null;
    }

    return mapToBookEntity(data);
  }

  async getFeatured(): Promise<Book[]> {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .order("rating", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching featured books:", error);
      return [];
    }

    return (data || []).map(mapToBookEntity);
  }

  async search(query: string): Promise<Book[]> {
    const supabase = await getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, cover_url, cover_color, description, category, pages, rating, rating_count, review_count, created_at")
      .or(`title.ilike.*${query}*,author.ilike.*${query}*,category.ilike.*${query}*`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching books:", error);
      return [];
    }

    return (data || []).map(mapToBookEntity);
  }
}