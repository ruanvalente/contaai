import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Book } from "@/features/book-dashboard/types/book.types";
import { BookDetailsPanelWidget } from "@/features/book-dashboard/widgets/book-details-panel.widget";

type BookDetailsModalProps = {
  book: Book | null;
  onClose: () => void;
}

export function BookDetailsModal({
  book,
  onClose,
}: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <>
      <motion.div
        className="hidden xl:block fixed top-[73px] right-0 bottom-0 w-80 lg:w-96 z-40 bg-primary-100 border-l border-primary-300 shadow-xl overflow-y-auto"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-sm lg:text-base font-bold text-gray-900">
              Detalhes do Livro
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-primary-200 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
            </button>
          </div>
          <BookDetailsPanelWidget book={book} isLoading={false} />
        </div>
      </motion.div>

      <motion.div
        className="xl:hidden fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-primary-100 rounded-t-3xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="sticky top-0 bg-primary-100 pt-3 pb-2 px-4 border-b border-primary-300 z-10">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                Detalhes do Livro
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-primary-200 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="p-4 pb-8">
            <BookDetailsPanelWidget book={book} isLoading={false} />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
