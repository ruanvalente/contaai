import { NextResponse } from "next/server";
import { getUserFavorites } from "@/infrastructure/api/favorites.actions";

export async function GET() {
  try {
    const favorites = await getUserFavorites();
    const favoritedIds = favorites.map((f) => f.bookId);
    return NextResponse.json(favoritedIds);
  } catch (err) {
    console.error("Error in user-favorites API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
