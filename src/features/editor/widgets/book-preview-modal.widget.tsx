"use client";

import { motion } from "framer-motion";

type BookPreviewModalProps = {
  isOpen: boolean;
  title: string;
  author: string;
  content: string;
  onClose: () => void;
}

export function BookPreviewModal({
  isOpen,
  title,
  author,
  content,
  onClose,
}: BookPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
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
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 truncate">
              Por {author}
            </p>
          </div>
          <button
            onClick={onClose}
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
  );
}
