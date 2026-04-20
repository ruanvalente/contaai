"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/features/notifications";
import { Container } from "@/shared/ui/container.ui";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { LibraryHeader } from "@/shared/ui/library-header.ui";
import { PublishedNotification } from "@/shared/ui/published-notification.ui";
import { EmptyLibraryState } from "@/shared/ui/empty-library-state.ui";
import { LibraryTabBar } from "@/shared/widgets/library-tab-bar.widget";
import { BookCard } from "@/shared/widgets/book-card.widget";
import { useLibraryTabs } from "@/features/library/hooks/use-library-tabs";
import { useUserBooks } from "@/features/library/hooks/use-user-books";
import { useLibraryState } from "@/features/library/hooks/use-library-state";
import { CreateBookModal } from "./create-book-modal.widget";
import { deleteUserBook } from "@/features/book-dashboard/actions/user-books.actions";
import { UserBook } from "@/server/domain/entities/user-book.entity";

export function LibraryContent() {
  const router = useRouter();
  const { activeTab, setTab } = useLibraryTabs();
  const { books, loading } = useUserBooks({ activeTab });
  const { publishedBookId, deletingId, setDeletingId } = useLibraryState();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = (bookId: string) => {
    setIsModalOpen(false);
    router.push(`/dashboard/editor/${bookId}`);
  };

  const handleDelete = async (book: UserBook) => {
    toast.error(`Excluir "${book.title}"? Esta ação não pode ser desfeita.`, {
      duration: Infinity,
      action: {
        label: "Excluir",
        onClick: () => {
          const deletePromise = (async () => {
            setDeletingId(book.id);
            const result = await deleteUserBook(book.id);
            setDeletingId(null);
            return result;
          })();

          toast.promise(deletePromise, {
            loading: "Excluindo livro...",
            success: () => {
              router.refresh();
              return "Livro excluído com sucesso";
            },
            error: (err) => err?.message || "Erro ao excluir livro",
          });
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  return (
    <>
      <LibraryHeader onCreateClick={() => setIsModalOpen(true)} />

      {publishedBookId && <PublishedNotification bookId={publishedBookId} />}

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <LibraryTabBar activeTab={activeTab} onTabChange={setTab} />

            {loading ? (
              <BookListSkeleton />
            ) : books.length === 0 ? (
              <EmptyLibraryState
                tab={activeTab}
                onCreateClick={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    tab={activeTab}
                    isDeleting={deletingId === book.id}
                    onDeleteClick={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>

      <CreateBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
