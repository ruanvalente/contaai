"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/features/notifications";
import { publishBook } from "@/features/book-dashboard/actions/user-books.actions";

type UseEditorPublishReturn = {
  isPublishing: boolean;
  publishError: string | null;
  handlePublish: (isRepublish?: boolean) => Promise<void>;
}

export function useEditorPublish(
  bookId: string
): UseEditorPublishReturn {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handlePublish = useCallback(async (isRepublish: boolean = false) => {
    const message = isRepublish
      ? "Tem certeza que deseja republicar sua história? As alterações ficarão disponíveis para os leitores."
      : "Tem certeza que deseja publicar sua história? Após a publicação, ela ficará disponível para outros leitores.";
    
    if (!confirm(message)) {
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    toast.loading("Publicando livro...");

    const result = await publishBook(bookId);

    if (result.success && result.book) {
      toast.success("Livro publicado com sucesso!");
      router.push(
        `/dashboard/library?tab=my-stories&published=${result.book.id}`
      );
    } else {
      toast.error(result.error || "Erro ao publicar");
      setPublishError(result.error || "Erro ao publicar");
      setIsPublishing(false);
    }
  }, [bookId, router]);

  return {
    isPublishing,
    publishError,
    handlePublish,
  };
}
