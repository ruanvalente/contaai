"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Book } from "@/domain/entities/book.entity";
import { BookCover } from "@/shared/ui/book-cover";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FavoriteButton } from "@/shared/ui/favorite-button.ui";
import { RatingStars } from "../ui/rating-stars.ui";
import { MetricsCard } from "../ui/metrics-card.ui";
import { BookOpenIcon, UsersIcon, MessageIcon } from "../ui/icons.ui";
import { useFavorites } from "@/features/discovery/hooks/use-favorites";

type BookDetailsPanelWidgetProps = {
  book: Book | null;
  isLoading?: boolean;
};

function BookDetailsSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-4 shadow-sm">
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="w-28 h-40 bg-primary-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-16 bg-primary-200 rounded-full" />
            <div className="h-5 bg-primary-200 rounded w-3/4" />
            <div className="h-4 bg-primary-200 rounded w-1/2" />
            <div className="h-4 bg-primary-200 rounded w-20" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-primary-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-64">
      <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mb-3">
        <BookOpenIcon className="w-6 h-6 text-gray-500" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Selecione um Livro
      </h3>
      <p className="text-xs text-gray-500">
        Clique em um livro para ver seus detalhes
      </p>
    </div>
  );
}

export function BookDetailsPanelWidget({
  book,
  isLoading = false,
}: BookDetailsPanelWidgetProps) {
  const router = useRouter();
  const {
    toggleFavorite,
    isFavorited,
    isLoading: isFavLoading,
  } = useFavorites();

  const handleReadNow = () => {
    if (book) {
      router.push(`/book/${book.id}`);
    }
  };

  if (isLoading) {
    return <BookDetailsSkeleton />;
  }

  if (!book) {
    return <EmptyState />;
  }

  const favorited = isFavorited(book.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="shrink-0 relative"
        >
          <BookCover
            title={book.title}
            coverUrl={book.coverUrl}
            coverColor={book.coverColor}
            size="md"
            className="w-28 h-40 sm:w-32 sm:h-44"
          />
          <FavoriteButton
            isFavorited={favorited}
            isLoading={isFavLoading}
            onClick={() => toggleFavorite(book)}
            className="absolute -top-2 -right-2"
          />
        </motion.div>

        <div className="flex-1 min-w-0 flex flex-col">
          <Badge
            variant="primary"
            className="text-[10px] px-2 py-0.5 self-start mb-1.5"
          >
            {book.category}
          </Badge>

          <h2 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-0.5">
            {book.title}
          </h2>

          <p className="text-xs text-gray-500 mb-1.5">{book.author}</p>

          <RatingStars rating={book.rating} size="sm" showValue={true} />

          <div className="mt-auto pt-2">
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <MetricsCard
          label="Páginas"
          value={book.pages}
          icon={<BookOpenIcon className="w-3.5 h-3.5" />}
          className="py-2"
        />
        <MetricsCard
          label="Avaliações"
          value={book.ratingCount}
          icon={<UsersIcon className="w-3.5 h-3.5" />}
          className="py-2"
        />
        <MetricsCard
          label="Resenhas"
          value={book.reviewCount}
          icon={<MessageIcon className="w-3.5 h-3.5" />}
          className="py-2"
        />
      </div>

      <div className="px-4 pb-4">
        <Button
          variant="primary"
          className="w-full py-2.5 text-sm"
          onClick={handleReadNow}
        >
          Ler Agora
        </Button>
      </div>
    </motion.div>
  );
}
