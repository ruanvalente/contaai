import { ImageResponse } from "next/og";
import { getPublicBookByIdAction } from "@/features/public-books/actions/public-books.actions";

export const alt = "Conta.AI - Livro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const book = await getPublicBookByIdAction(id);

  if (!book) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "linear-gradient(to bottom, #1a1a1a, #2d2d2d)",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: "bold", fontFamily: "serif" }}>
            Conta.AI
          </div>
          <div style={{ marginTop: 24, opacity: 0.8 }}>Livro não encontrado</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 36,
          background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily: "serif",
              fontWeight: "bold",
            }}
          >
            Conta<span style={{ color: "#e94560" }}>.AI</span>
          </div>
          <div
            style={{
              fontSize: 20,
              opacity: 0.7,
            }}
          >
            {book.category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 60,
          }}
        >
          {book.coverUrl && (
            <img
              src={book.coverUrl}
              style={{
                width: 300,
                height: 400,
                objectFit: "cover",
                borderRadius: 12,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: "bold",
                fontFamily: "serif",
                lineHeight: 1.2,
              }}
            >
              {book.title}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.8,
              }}
            >
              por {book.author}
            </div>
            {book.rating > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div style={{ fontSize: 32 }}>
                  {"★".repeat(Math.round(book.rating))}
                </div>
                <div style={{ fontSize: 20, opacity: 0.7 }}>
                  ({book.ratingCount} avaliações)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}