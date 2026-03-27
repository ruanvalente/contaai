import { useRouter } from "next/navigation";
import { UserBook } from "@/features/book-dashboard/types/user-book.types";
import { Badge } from "@/shared/ui/badge.ui";
import { Button } from "@/shared/ui/button";
import { Pencil, Eye, Trash2 } from "lucide-react";
import { LibraryTab } from "@/shared/hooks/use-library-tabs";

type BookCardProps = {
  book: UserBook;
  tab: LibraryTab;
  isDeleting: boolean;
  onDeleteClick: (book: UserBook) => void;
};

export function BookCard({ book, tab, isDeleting, onDeleteClick }: BookCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (tab === "my-stories") {
      router.push(`/dashboard/editor/${book.id}`);
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  const handleDelete = () => {
    onDeleteClick(book);
  };

  return (
    <div
      className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg shadow flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden"
        style={{
          backgroundColor: book.coverColor,
          backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!book.coverUrl && (
          <span className="text-white/90 font-display text-xs text-center line-clamp-4">
            {book.title}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge>{book.category}</Badge>
          <span className="text-xs text-gray-500">{book.wordCount} palavras</span>
          {book.status === "published" && (
            <Badge className="bg-green-100 text-green-700">Published</Badge>
          )}
        </div>
        {tab === "reading" && book.readingProgress > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">Progresso</span>
              <span className="text-xs text-gray-700 font-medium">
                {book.readingProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-primary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full"
                style={{ width: `${book.readingProgress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button
            variant="secondary"
            className="text-xs px-3 py-1.5 rounded-lg"
            onClick={handleClick}
          >
            {tab === "my-stories" ? (
              <>
                <Pencil className="w-3 h-3 mr-1" />
                Editar
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Continuar
              </>
            )}
          </Button>

          {tab === "my-stories" && (
            <Button
              variant="secondary"
              className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
