"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Palette, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { createUserBook } from "@/features/book-dashboard/actions/user-books.actions";
import {
  USER_BOOK_CATEGORIES,
  COVER_COLORS,
  generateRandomCoverColor,
} from "@/features/book-dashboard/config/book-config";
import { Button } from "@/shared/ui/button.ui";
import { useAuthStore } from "@/shared/storage/use-auth-store";

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookId: string) => void;
}

export function CreateBookModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBookModalProps) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<string>(USER_BOOK_CATEGORIES[0]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverColor, setCoverColor] = useState(generateRandomCoverColor());
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setAuthor("");
      setCategory(USER_BOOK_CATEGORIES[0]);
      setCoverUrl(null);
      setCoverColor(generateRandomCoverColor());
      setError(null);
    }
  }, [isOpen]);

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Tipo de arquivo inválido. Use uma imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 2MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverUrl(e.target?.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Erro ao ler arquivo");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRandomColor = useCallback(() => {
    setCoverColor(generateRandomCoverColor());
    setCoverUrl(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("O título é obrigatório");
      return;
    }

    if (!author.trim()) {
      setError("O autor é obrigatório");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createUserBook(
        {
          title: title.trim(),
          author: author.trim(),
          category: category as (typeof USER_BOOK_CATEGORIES)[number],
          coverUrl: coverUrl || undefined,
          coverColor,
        },
        user?.id,
      );

      if (result.success && result.book) {
        onSuccess?.(result.book.id);
        onClose();
      } else {
        setError(result.error || "Erro ao criar livro");
      }
    } catch {
      setError("Erro interno");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
                <h2
                  id="modal-title"
                  className="text-xl font-semibold font-display text-gray-900"
                >
                  Criar Nova História
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-primary-100 transition-colors"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {error}
                  </div>
                )}

                <div className="flex gap-6">
                  <div
                    className="w-28 h-40 rounded-lg shadow-md shrink-0 overflow-hidden relative"
                    style={{ backgroundColor: coverColor }}
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt="Capa do livro"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }}
                        className="sr-only"
                        aria-label="Upload imagem de capa"
                        disabled={isUploading || isCreating}
                      />
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {isUploading ? "Enviando..." : "Upload de capa"}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleRandomColor}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-primary-300 rounded-lg hover:bg-primary-50 transition-colors w-full"
                      disabled={isCreating}
                    >
                      <Palette className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Cor aleatória
                      </span>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {COVER_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setCoverColor(color);
                            setCoverUrl(null);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform",
                            coverColor === color
                              ? "ring-2 ring-offset-2 ring-accent-500 scale-110"
                              : "hover:scale-105",
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Selecionar cor ${color}`}
                          aria-pressed={coverColor === color}
                          disabled={isCreating}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o título da sua história"
                    className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Autor <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nome do autor"
                    className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all bg-white"
                    disabled={isCreating}
                  >
                    {USER_BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isCreating || isUploading}
                    className="flex-1"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar História"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
