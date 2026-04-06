"use client";

import { ArrowLeft, Eye, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";

type BookEditorHeaderProps = {
  title: string;
  author: string;
  status: "draft" | "published";
  isSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  isPublishing: boolean;
  publishError: string | null;
  onBack: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function BookEditorHeader({
  title,
  author,
  status,
  isSaving,
  lastSaved,
  isDirty,
  isPublishing,
  publishError,
  onBack,
  onPreview,
  onPublish,
}: BookEditorHeaderProps) {
  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-primary-200 shadow-sm">
        <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-full hover:bg-primary-100 transition-colors shrink-0"
              aria-label="Voltar para biblioteca"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold font-display truncate">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Por {author}
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
              onClick={onPreview}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <Eye className="w-3 h-3 sm:w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {status === "draft" && (
              <Button
                variant="primary"
                onClick={onPublish}
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
    </>
  );
}
