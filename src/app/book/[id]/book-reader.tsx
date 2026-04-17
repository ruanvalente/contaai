"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";

import { ArrowLeft, BookOpen, FileText, Star, Calendar, Users, Heart } from "lucide-react";

const viewerTheme = {
  paragraph: "mb-6 leading-8 text-gray-800 text-lg font-serif",
  heading: {
    h1: "text-4xl font-bold mb-8 mt-12 font-display text-gray-900",
    h2: "text-3xl font-bold mb-6 mt-10 font-display text-gray-900",
    h3: "text-2xl font-semibold mb-4 mt-8 font-display text-gray-900",
  },
  list: {
    ul: "list-disc ml-8 mb-6 space-y-2",
    ol: "list-decimal ml-8 mb-6 space-y-2",
    listitem: "mb-1 text-lg",
  },
  quote:
    "border-l-4 border-accent-500 pl-6 italic text-gray-700 my-8 bg-primary-50 py-4 pr-4 rounded-r-lg text-xl",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 px-2 py-1 rounded font-mono text-base text-accent-600",
  },
  code: "bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-base overflow-x-auto my-6",
  link: "text-accent-500 underline hover:text-accent-600",
};

function BookCover({
  coverUrl,
  coverColor,
  title,
}: {
  coverUrl?: string;
  coverColor: string;
  title: string;
}) {
  if (coverUrl) {
    return (
      <div className="relative w-40 h-56 md:w-48 md:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-xl">
        <Image src={coverUrl} alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="w-40 h-56 md:w-48 md:h-72 flex-shrink-0 rounded-lg shadow-xl flex items-center justify-center"
      style={{ backgroundColor: coverColor }}
    >
      <BookOpen className="w-16 h-16 text-white/50" />
    </div>
  );
}

function ContentViewer({ content }: { content: string }) {
  const editorState = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.root) {
        return content;
      }
      return JSON.stringify({
        root: {
          children: [
            { type: "paragraph", children: [{ type: "text", text: content }] },
          ],
          type: "root",
          version: 1,
        },
      });
    } catch {
      return JSON.stringify({
        root: {
          children: [
            { type: "paragraph", children: [{ type: "text", text: content }] },
          ],
          type: "root",
          version: 1,
        },
      });
    }
  }, [content]);

  const initialConfig = useMemo(
    () => ({
      namespace: "BookViewer",
      theme: viewerTheme,
      onError: (error: Error) => console.error(error),
      editable: false,
      editorState,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
      ],
    }),
    [editorState],
  );

  return (
    <div className="prose prose-lg max-w-none">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none min-h-[200px] p-4" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  );
}

type BookReaderProps = {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    coverColor: string;
    category: string;
    content?: string;
    description?: string;
    pages?: number;
    rating?: number;
    ratingCount?: number;
    wordCount?: number;
    followersCount?: number;
    favoritesCount?: number;
    publishedAt?: Date;
    createdAt: Date;
  };
  isUserBook: boolean;
};

export function BookReader({ book, isUserBook }: BookReaderProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <motion.header
        className="bg-white border-b border-primary-200 sticky top-0 z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <h1 className="font-display font-bold text-lg text-gray-900 truncate max-w-xs">
            {book.title}
          </h1>
          <div className="w-20" />
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-primary-200 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="md:flex">
            <div className="p-6 md:p-10 flex md:block justify-center">
              <BookCover
                coverUrl={book.coverUrl}
                coverColor={book.coverColor}
                title={book.title}
              />
            </div>

            <div className="flex-1 p-6 md:p-10 pt-0 md:pt-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">por {book.author}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                  {book.category}
                </span>
                {isUserBook && book.publishedAt && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Publicado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-t border-primary-100 pt-4">
                {book.followersCount !== undefined && book.followersCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{book.followersCount} seguidores</span>
                  </div>
                )}
                {book.favoritesCount !== undefined && book.favoritesCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{book.favoritesCount} favoritos</span>
                  </div>
                )}
                {book.rating !== undefined && book.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{book.rating.toFixed(1)}</span>
                    <span className="text-gray-400">
                      ({book.ratingCount} avaliações)
                    </span>
                  </div>
                )}
                {book.pages !== undefined && book.pages > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{book.pages} páginas</span>
                  </div>
                )}
                {book.wordCount !== undefined && book.wordCount > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>
                      {book.wordCount.toLocaleString("pt-BR")} palavras
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(book.createdAt)}</span>
                </div>
              </div>

              {book.description && (
                <p className="mt-6 text-gray-700 leading-relaxed">
                  {book.description}
                </p>
              )}
            </div>
          </div>

          {isUserBook && (
            <div className="border-t border-primary-100 px-6 md:px-10 py-6 bg-primary-50/50">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
                Conteúdo
              </h2>
              {book.content ? (
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-primary-100">
                  <ContentViewer content={book.content} />
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Este livro ainda não possui conteúdo.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
