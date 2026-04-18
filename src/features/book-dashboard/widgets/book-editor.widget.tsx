"use client";

import { useState, memo } from "react";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button.ui";
import { BookEditorHeader } from "./book-editor-header.widget";
import { EditorToolbar } from "./editor-toolbar.widget";
import { EditorContentSync } from "./editor-content-sync.widget";

import {
  useBookEditor,
  useEditorPublish,
  useEditorBackupInterval,
} from "@/features/book-dashboard/hooks";
import { useBookEditorStore } from "@/features/book-dashboard/store/book-editor.store";
import { editorTheme, AutoSavePlugin } from "@/features/book-dashboard/editor";

const ContentRecoveryModal = dynamic(
  () => import("./content-recovery-modal.widget").then((m) => m.ContentRecoveryModal),
  { ssr: false }
);

const BookPreviewModal = dynamic(
  () => import("./book-preview-modal.widget").then((m) => m.BookPreviewModal),
  { ssr: false }
);

const PLACEHOLDER = (
  <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 text-gray-400 pointer-events-none text-sm sm:text-base">
    Comece a escrever sua história...
  </div>
);

const INITIAL_CONFIG = {
  namespace: "BookEditor",
  theme: editorTheme,
  nodes: [
    HeadingNode, QuoteNode, ListNode, ListItemNode,
    CodeNode, CodeHighlightNode, LinkNode,
  ],
  onError: (error: Error) => console.error(error),
} as const;

type BookEditorProps = {
  bookId: string;
}

export const BookEditor = memo(({ bookId }: BookEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const {
    book,
    loading,
    isInitialized,
    showRecoveryModal,
    backupData,
    handleRecoverContent,
    handleDiscardRecovery,
    handleBack,
  } = useBookEditor(bookId);

  const { isPublishing, publishError, handlePublish } = useEditorPublish(bookId);

  const { isSaving, lastSaved, isDirty, content } = useBookEditorStore(
    useShallow((state) => ({
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      isDirty: state.isDirty,
      content: state.content,
    }))
  );

  useEditorBackupInterval(bookId, isInitialized, book?.title);

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

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <BookEditorHeader
        title={book.title}
        author={book.author}
        status={book.status}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isDirty={isDirty}
        isPublishing={isPublishing}
        publishError={publishError}
        onBack={handleBack}
        onPreview={() => setShowPreview(true)}
        onPublish={() => handlePublish(book.status === "published")}
      />

      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <LexicalComposer initialConfig={INITIAL_CONFIG} key={bookId}>
          <div className="border border-primary-200 rounded-xl overflow-hidden bg-white shadow-sm h-full min-h-[calc(100vh-140px)]">
            <EditorToolbar />
            <div className="relative min-h-[calc(100vh-200px)]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[calc(100vh-200px)] p-3 sm:p-4 md:p-6 outline-none" />
                }
                placeholder={PLACEHOLDER}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <EditorContentSync onInitialized={() => {}} />
            <AutoSavePlugin />
          </div>
        </LexicalComposer>
      </div>

      <BookPreviewModal
        isOpen={showPreview}
        title={book.title}
        author={book.author}
        content={content}
        onClose={() => setShowPreview(false)}
      />

      <ContentRecoveryModal
        isOpen={showRecoveryModal}
        onRecover={handleRecoverContent}
        onDiscard={handleDiscardRecovery}
        backupTimestamp={backupData?.timestamp}
        backupTitle={backupData?.title}
      />
    </div>
  );
});

BookEditor.displayName = "BookEditor";
