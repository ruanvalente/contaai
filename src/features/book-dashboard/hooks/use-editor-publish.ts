"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/features/notifications";
import { publishBook } from "@/features/book-dashboard/actions/user-books.actions";
import { useUserBooksStore } from "@/shared/store/user-books.store";
import type { UserBook } from "@/server/domain/entities/user-book.entity";

type UseEditorPublishReturn = {
  isPublishing: boolean;
  publishError: string | null;
  handlePublish: (isRepublish?: boolean, onSuccess?: () => void) => void;
};

export function useEditorPublish(bookId: string): UseEditorPublishReturn {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const publishedBookRef = useRef<UserBook | null>(null);

  const handlePublish = useCallback(
    (isRepublish: boolean = false, onSuccess?: () => void) => {
      const message = isRepublish
        ? " republicar sua história? As alterações ficarão disponíveis para os leitores."
        : " publicar sua história? Após a publicação, ela ficará disponível para outros leitores.";

      toast.error(`Tem certeza que deseja${message}`, {
        duration: Infinity,
        action: {
          label: "Publicar",
          onClick: () => {
            const publishPromise = (async () => {
              setIsPublishing(true);
              setPublishError(null);
              const result = await publishBook(bookId);
              setIsPublishing(false);
              if (!result.success || !result.book) {
                throw new Error(result.error || "Erro ao publicar");
              }
              publishedBookRef.current = result.book;
              return result;
            })();

            toast.promise(publishPromise as any, {
              loading: "Publicando livro...",
              success: () => {
                const book = publishedBookRef.current;
                if (book) {
                  useUserBooksStore.getState().addBook(book);
                }
                router.refresh();
                if (onSuccess) {
                  onSuccess();
                } else {
                  router.push(`/dashboard/library?tab=my-stories`);
                }
                return "Livro publicado com sucesso!";
              },
              error: (err: Error) => err.message,
            });
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {},
        },
      });
    },
    [bookId, router],
  );

  return {
    isPublishing,
    publishError,
    handlePublish,
  };
}
