import { NextResponse } from "next/server";
import { getBooksAction } from "@/infrastructure/api/books.actions";

export async function GET() {
  try {
    const books = await getBooksAction();
    return NextResponse.json(books);
  } catch (err) {
    console.error("Error in books API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
