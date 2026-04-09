import { getSupabaseServerClient } from '@/utils/supabase/server';

export type BookRow = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  content: string | null;
  content_url: string | null;
  status: string;
  reading_status: string;
  reading_progress: number;
  category: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type UnifiedBookRow = {
  source: 'catalog' | 'user';
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_color: string | null;
  description: string | null;
  category: string;
  page_count: number | null;
  rating: number | string | null;
  rating_count: number | null;
  review_count: number | null;
  created_at: string;
  user_id: string | null;
  status: string | null;
};

export type BooksFilters = {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function fetchUserBooksByUserId(
  userId: string,
  options?: { status?: string; readingStatus?: string }
) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('user_books')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.readingStatus) {
    query = query.eq('reading_status', options.readingStatus);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user books:', error);
    return null;
  }

  return data as BookRow[];
}

export async function fetchBookById(bookId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  return data as BookRow;
}

export async function fetchUnifiedBooks(filters?: BooksFilters) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('unified_books')
    .select(
      'source, id, title, author, cover_url, cover_color, description, category, page_count, rating, rating_count, review_count, created_at, user_id, status'
    )
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    query = query.or(`title.ilike.*${searchTerm}*,author.ilike.*${searchTerm}*`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching unified books:', error);
    return [];
  }

  return data as UnifiedBookRow[];
}

export async function fetchCategories() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('name, icon')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as { name: string; icon: string }[];
}

export async function insertBook(book: Partial<BookRow>) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_books')
    .insert(book)
    .select()
    .single();

  if (error) {
    console.error('Error inserting book:', error);
    return null;
  }

  return data as BookRow;
}

export async function updateBook(bookId: string, updates: Partial<BookRow>) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('user_books')
    .update(updates)
    .eq('id', bookId)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    return null;
  }

  return data as BookRow;
}

export async function deleteBookById(bookId: string) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', bookId);

  if (error) {
    console.error('Error deleting book:', error);
    return false;
  }

  return true;
}