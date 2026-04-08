import { NextRequest, NextResponse } from "next/server";
import { getUserBooksAction, UserBookFilter } from "@/infrastructure/api/user-books.actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as UserBookFilter | null;

  try {
    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const books = await getUserBooksAction(type);
    return NextResponse.json(books);
  } catch (err) {
    console.error("Error in user-books API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
