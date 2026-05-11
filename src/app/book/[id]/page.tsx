import { Suspense } from "react";
import { BookPageClient } from "./book-page-client";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";
import type { Metadata } from "next";
import { getPublicBookByIdAction } from "@/features/public-books/actions/public-books.actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function BookSchemaLd({ book }: { book: NonNullable<Awaited<ReturnType<typeof getPublicBookByIdAction>>> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author,
    },
    "description": book.description || `Leia "${book.title}" de ${book.author} na Conta.AI`,
    "genre": book.category,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://contaai.vercel.app"}/book/${book.id}`,
    ...(book.coverUrl && {
      "image": book.coverUrl,
    }),
    ...(book.rating > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": book.rating,
        "reviewCount": book.ratingCount,
      },
    }),
    ...(book.pages > 0 && {
      "numberOfPages": book.pages,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getPublicBookByIdAction(id);
  
  if (!book) {
    return { title: "Livro não encontrado | Conta.AI" };
  }
  
  return {
    title: `${book.title} - ${book.author} | Conta.AI`,
    description: book.description || `Leia "${book.title}" de ${book.author} na Conta.AI`,
    openGraph: {
      title: book.title,
      description: book.description || `Leia "${book.title}" de ${book.author}`,
      type: "book",
      authors: [book.author],
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description: book.description || `Leia "${book.title}" de ${book.author}`,
      images: book.coverUrl ? [book.coverUrl] : [],
    },
  };
}

export default async function BookPage(props: PageProps) {
  const { id } = await props.params;
  const book = await getPublicBookByIdAction(id);

  return (
    <>
      {book && <BookSchemaLd book={book} />}
      <Suspense fallback={<PageSkeleton />}>
        <BookPageClient bookId={id} />
      </Suspense>
    </>
  );
}
