"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import {
  $getRoot,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { motion } from "framer-motion";
import {
  Eye,
  Send,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Minus,
  AlignJustify,
} from "lucide-react";
import {
  saveBookContent,
  publishBook,
  getBookById,
} from "../actions/user-books.actions";
import { useBookEditorStore } from "../store/book-editor.store";
import { Button } from "@/shared/ui/button";
import { ToolbarButton, ToolbarDivider } from "./book-editor-toolbar";

const theme = {
  paragraph: "mb-4 leading-7 text-gray-700",
  heading: {
    h1: "text-4xl font-bold mb-6 font-display text-gray-900",
    h2: "text-3xl font-bold mb-5 font-display text-gray-900",
    h3: "text-2xl font-semibold mb-4 font-display text-gray-900",
  },
  list: {
    ul: "list-disc ml-6 mb-4 space-y-1",
    ol: "list-decimal ml-6 mb-4 space-y-1",
    listitem: "mb-1",
  },
  quote:
    "border-l-4 border-accent-500 pl-4 italic text-gray-600 my-4 bg-primary-50 py-2 pr-2 rounded-r",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 px-1 py-0.5 rounded font-mono text-sm text-accent-600",
  },
  code: "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto",
  link: "text-accent-500 underline hover:text-accent-600",
};

function AutoSavePlugin() {
  const { content, bookId, isDirty, setSaving, markSaved } =
    useBookEditorStore();
  const [lastContent, setLastContent] = useState(content);

  useEffect(() => {
    if (!isDirty || !bookId || content === lastContent) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      const result = await saveBookContent(bookId, content);
      if (result.success) {
        markSaved();
        setLastContent(content);
      } else {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, isDirty, bookId, lastContent, setSaving, markSaved]);

  return null;
}

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && content) {
      initializedRef.current = true;
      editor.update(() => {
        const root = $getRoot();
        if (root.getFirstChild() === null) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(content));
          root.append(paragraph);
        }
      });
    }
  }, [editor, content]);

  return null;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const anchorNode = selection.anchorNode;
          if (anchorNode) {
            const parent = anchorNode.parentElement;
            setIsBold(parent?.closest("b, strong") !== null);
            setIsItalic(parent?.closest("i, em") !== null);
            setIsUnderline(parent?.closest("u") !== null);
            setIsStrikethrough(parent?.closest("s, strike, del") !== null);
            setIsCode(
              parent?.closest("code") !== null ||
                anchorNode.parentElement?.closest("code") !== null,
            );
          }
        }

        // Check block type
        const root = $getRoot();
        const firstChild = root.getFirstChild();
        if (firstChild) {
          const type = firstChild.getType();
          if (type === "heading") {
            const headingNode = firstChild as HeadingNode;
            setBlockType("h" + headingNode.getTag());
          } else if (type === "list") {
            setBlockType("list");
          } else if (type === "quote") {
            setBlockType("quote");
          } else {
            setBlockType("paragraph");
          }
        }
      });
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      UNDO_COMMAND,
      () => {
        return false;
      },
      1,
    );
  }, [editor]);

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      UNDO_COMMAND,
      () => {
        return false;
      },
      1,
    );
    const unregisterRedo = editor.registerCommand(
      REDO_COMMAND,
      () => {
        return false;
      },
      1,
    );
    return () => {
      unregisterUndo();
      unregisterRedo();
    };
  }, [editor]);

  const formatBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  const formatItalic = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  const formatUnderline = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  const formatStrikethrough = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  const formatCode = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const insertUnorderedList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const insertHorizontalRule = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText("— ");
      }
    });
  };

  const formatAlignLeft = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  const formatAlignCenter = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  const formatAlignRight = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  const formatAlignJustify = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-primary-200 bg-primary-50">
      {/* Undo/Redo */}
      <ToolbarButton onClick={() => {}} icon={Undo} title="Desfazer (Ctrl+Z)" />
      <ToolbarButton onClick={() => {}} icon={Redo} title="Refazer (Ctrl+Y)" />

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={formatBold}
        isActive={isBold}
        icon={Bold}
        title="Negrito (Ctrl+B)"
      />
      <ToolbarButton
        onClick={formatItalic}
        isActive={isItalic}
        icon={Italic}
        title="Itálico (Ctrl+I)"
      />
      <ToolbarButton
        onClick={formatUnderline}
        isActive={isUnderline}
        icon={Underline}
        title="Sublinhado (Ctrl+U)"
      />
      <ToolbarButton
        onClick={formatStrikethrough}
        isActive={isStrikethrough}
        icon={Strikethrough}
        title="Tachado"
      />
      <ToolbarButton
        onClick={formatCode}
        isActive={isCode}
        icon={Code}
        title="Código"
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => formatHeading("h1")}
        isActive={blockType === "h1"}
        icon={Heading1}
        title="Título 1"
      />
      <ToolbarButton
        onClick={() => formatHeading("h2")}
        isActive={blockType === "h2"}
        icon={Heading2}
        title="Título 2"
      />
      <ToolbarButton
        onClick={() => formatHeading("h3")}
        isActive={blockType === "h3"}
        icon={Heading3}
        title="Título 3"
      />
      <ToolbarButton
        onClick={formatParagraph}
        isActive={blockType === "paragraph"}
        icon={Type}
        title="Parágrafo"
      />

      <ToolbarDivider />

      {/* Lists & Quotes */}
      <ToolbarButton
        onClick={insertUnorderedList}
        isActive={false}
        icon={List}
        title="Lista com marcadores"
      />
      <ToolbarButton
        onClick={insertOrderedList}
        isActive={false}
        icon={ListOrdered}
        title="Lista numerada"
      />
      <ToolbarButton
        onClick={formatQuote}
        isActive={blockType === "quote"}
        icon={Quote}
        title="Citação"
      />

      <ToolbarDivider />

      {/* Extras */}
      <ToolbarButton
        onClick={insertHorizontalRule}
        icon={Minus}
        title="Linha horizontal"
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={formatAlignLeft}
        icon={AlignLeft}
        title="Alinhar à esquerda"
      />
      <ToolbarButton
        onClick={formatAlignCenter}
        icon={AlignCenter}
        title="Centralizar"
      />
      <ToolbarButton
        onClick={formatAlignRight}
        icon={AlignRight}
        title="Alinhar à direita"
      />
      <ToolbarButton
        onClick={formatAlignJustify}
        icon={AlignJustify}
        title="Justificar"
      />
    </div>
  );
}

interface BookEditorProps {
  bookId: string;
}

export function BookEditor({ bookId }: BookEditorProps) {
  const router = useRouter();
  const [book, setBook] = useState<{
    title: string;
    author: string;
    content: string;
    status: "draft" | "published";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const {
    content,
    setContent,
    initialize,
    isSaving,
    lastSaved,
    isDirty,
  } = useBookEditorStore();

  useEffect(() => {
    async function loadBook() {
      try {
        const bookData = await getBookById(bookId);
        if (bookData) {
          setBook({
            title: bookData.title,
            author: bookData.author,
            content: bookData.content || "",
            status: bookData.status,
          });
          initialize({
            bookId: bookData.id,
            title: bookData.title,
            author: bookData.author,
            content: bookData.content,
            coverUrl: bookData.coverUrl,
            coverColor: bookData.coverColor,
            category: bookData.category,
            status: bookData.status,
          });
        } else {
          router.push("/dashboard/library");
        }
      } catch (err) {
        console.error("Error loading book:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId, router, initialize]);

  const handlePublish = useCallback(async () => {
    if (
      !confirm(
        "Tem certeza que deseja publicar sua história? Após a publicação, ela ficará disponível para outros leitores.",
      )
    ) {
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    const result = await publishBook(bookId);

    if (result.success && result.book) {
      setIsPublishing(false);
      router.push(
        `/dashboard/library?tab=my-stories&published=${result.book.id}`,
      );
    } else {
      setPublishError(result.error || "Erro ao publicar");
      setIsPublishing(false);
    }
  }, [bookId, router]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/library");
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-gray-600">Livro não encontrado</p>
        <Button variant="secondary" onClick={handleBack}>
          Voltar à Biblioteca
        </Button>
      </div>
    );
  }

  const initialConfig = {
    namespace: "BookEditor",
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
    onError: (error: Error) => console.error(error),
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-primary-200 shadow-sm">
        <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 rounded-full hover:bg-primary-100 transition-colors shrink-0"
              aria-label="Voltar para biblioteca"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold font-display truncate">
                {book.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Por {book.author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 animate-spin text-gray-400" />
                  <span className="text-gray-500 hidden sm:inline">
                    Salvando...
                  </span>
                </>
              ) : lastSaved && !isDirty ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 text-green-500" />
                  <span className="text-gray-500 hidden sm:inline">Salvo</span>
                </>
              ) : isDirty ? (
                <span className="text-yellow-600 text-xs sm:text-sm">
                  Não salvo
                </span>
              ) : null}
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <Eye className="w-3 h-3 sm:w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {book.status === "draft" && (
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 sm:w-4" />
                    <span className="hidden sm:inline">Publicar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {publishError && (
          <div className="px-2 sm:px-4 md:px-6 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{publishError}</p>
          </div>
        )}
      </div>

      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <LexicalComposer initialConfig={initialConfig} key={bookId}>
          <div className="border border-primary-200 rounded-xl overflow-hidden bg-white shadow-sm h-full min-h-[calc(100vh-140px)]">
            <ToolbarPlugin />
            <div className="relative min-h-[calc(100vh-200px)]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[calc(100vh-200px)] p-3 sm:p-4 md:p-6 outline-none" />
                }
                placeholder={
                  <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 text-gray-400 pointer-events-none text-sm sm:text-base">
                    Comece a escrever sua história...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin
              onChange={(editorState) => {
                editorState.read(() => {
                  const root = $getRoot();
                  const textContent = root.getTextContent();
                  setContent(textContent);
                });
              }}
            />
            <AutoSavePlugin />
            <InitialContentPlugin content={book.content} />
          </div>
        </LexicalComposer>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-primary-200 px-4 py-3 sm:p-6 flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold truncate">
                  {book.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 truncate">
                  Por {book.author}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-primary-100 rounded-full shrink-0"
                aria-label="Fechar preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-7 text-sm sm:text-base">
                  {content || "Sem conteúdo ainda..."}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
