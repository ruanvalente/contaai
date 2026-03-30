import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as
    | "my-stories"
    | "reading"
    | "completed"
    | null;

  try {
    const supabase = await getSupabaseServerClient();

    // Try to get user from header (set by middleware) or from cookie
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      let query = supabase
        .from("user_books")
        .select("*")
        .eq("user_id", user.id);

      switch (type) {
        case "my-stories":
          query = query.in("status", ["draft", "published"]);
          break;
        case "reading":
          query = query.eq("reading_status", "reading");
          break;
        case "completed":
          query = query.eq("reading_status", "completed");
          break;
      }

      const { data, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // Use userId from header
    let query = supabase
      .from("user_books")
      .select("*")
      .eq("user_id", userId);

    switch (type) {
      case "my-stories":
        query = query.in("status", ["draft", "published"]);
        break;
      case "reading":
        query = query.eq("reading_status", "reading");
        break;
      case "completed":
        query = query.eq("reading_status", "completed");
        break;
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error in user-books API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
