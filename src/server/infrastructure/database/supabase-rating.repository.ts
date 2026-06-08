import { IRatingRepository, BookRatingData } from "@/server/domain/repositories/rating.repository";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export class SupabaseRatingRepository implements IRatingRepository {
  async checkBookExists(bookId: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('unified_books')
      .select('id')
      .eq('id', bookId)
      .single();
    return !!data;
  }

  async getExistingRating(bookId: string, userId?: string, sessionId?: string): Promise<{ id: string } | null> {
    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from('ratings')
      .select('id')
      .eq('book_id', bookId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId).is('user_id', null);
    } else {
      return null;
    }

    const { data } = await query.single();
    return data;
  }

  async upsertRating(bookId: string, rating: number, userId?: string, sessionId?: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();

    const existing = await this.getExistingRating(bookId, userId, sessionId);

    if (existing?.id) {
      const updateData: Record<string, unknown> = { rating };
      if (userId) {
        updateData.user_id = userId;
      } else if (sessionId) {
        updateData.session_id = sessionId;
        updateData.user_id = null;
      }
      const { error } = await supabase
        .from('ratings')
        .update(updateData)
        .eq('id', existing.id);
      return !error;
    }

    const ratingData: Record<string, unknown> = {
      book_id: bookId,
      rating,
    };

    if (userId) {
      ratingData.user_id = userId;
      ratingData.rated_by_type = 'user';
    } else if (sessionId) {
      ratingData.session_id = sessionId;
      ratingData.rated_by_type = 'anonymous';
      ratingData.user_id = null;
    } else {
      const fallbackSessionId = 'anonymous-' + Math.random().toString(36).substring(7);
      ratingData.session_id = fallbackSessionId;
      ratingData.rated_by_type = 'anonymous';
      ratingData.user_id = null;
    }

    const { error } = await supabase.from('ratings').insert(ratingData);
    return !error;
  }

  async getBookRatingData(bookId: string): Promise<BookRatingData | null> {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('unified_books')
      .select('rating, rating_count')
      .eq('id', bookId)
      .single();

    if (!data) return null;
    return {
      newRating: data.rating || 0,
      ratingCount: data.rating_count || 0,
    };
  }

  async getUserRating(bookId: string, userId?: string, sessionId?: string): Promise<number | null> {
    const supabase = await getSupabaseServerClient();

    let query;
    if (userId) {
      query = supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();
    } else if (sessionId) {
      query = supabase
        .from('ratings')
        .select('rating')
        .eq('session_id', sessionId)
        .eq('book_id', bookId)
        .single();
    } else {
      return null;
    }

    const { data } = await query;
    return data?.rating || null;
  }
}
