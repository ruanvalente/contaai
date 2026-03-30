import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("book_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching favorites:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const favoritedIds = (data || []).map((f) => f.book_id);

    return NextResponse.json(favoritedIds);
  } catch (err) {
    console.error("Error in user-favorites API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
