"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/shared/ui/container";
import { BookListSkeleton } from "@/shared/ui/skeleton.ui";
import { Pagination } from "@/shared/ui/pagination.ui";
import { useCategoryCache, generateCacheKey } from "@/features/discovery";
import { Book } from "@/domain/entities/book.entity";
import { searchBooks } from '@/features/discovery/application/queries/search-books.query';
import { HardDrive, Download, Trash2 } from "lucide-react";

type DownloadsContentProps = {
  books: Book[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export function DownloadsContent({ books: initialBooks, pagination }: DownloadsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [downloads, setDownloads] = useState<string[]>([]);

  const { addToCache, getFromCache } = useCategoryCache();

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const handleSearch = useCallback(async (query: string) => {
    const cacheKey = generateCacheKey("downloads", query, "all");

    const cached = getFromCache(cacheKey);
    if (cached) {
      setBooks(cached);
      return;
    }

    setIsLoading(true);
    try {
      if (query.trim()) {
        const results = await searchBooks({ query });
        setBooks(results);
        addToCache(cacheKey, results);
      } else {
        setBooks(initialBooks);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialBooks, addToCache, getFromCache]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const removeDownload = (id: string) => {
    if (downloads.includes(id)) {
      setDownloads(downloads.filter((d) => d !== id));
    } else {
      setDownloads([...downloads, id]);
    }
  };

  const displayBooks = books.filter((book) => !downloads.includes(book.id));
  const totalSize = displayBooks.length * 2.5;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Downloads
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Suas histórias offline
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Armazenamento usado</p>
                    <p className="text-xs text-gray-500">{displayBooks.length} histórias baixadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
                  <p className="text-xs text-gray-500">de 500 MB</p>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-primary-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-500 rounded-full transition-all" 
                  style={{ width: `${(totalSize / 500) * 100}%` }} 
                />
              </div>
            </div>

            {displayBooks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-10 h-10 text-gray-500" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum download</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Baixe histórias para ler offline. Elas aparecerão aqui.
                </p>
              </div>
            ) : isLoading ? (
              <BookListSkeleton />
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Histórias baixadas</h2>
                    <button className="text-sm text-accent-600 hover:underline">
                      Baixar mais
                    </button>
                  </div>

                  {displayBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex gap-3 p-3 bg-white rounded-xl shadow-sm"
                    >
                      <div
                        className="w-16 h-24 rounded-lg shadow flex-shrink-0 flex items-center justify-center p-1"
                        style={{ backgroundColor: book.coverColor }}
                      >
                        <span className="text-white/90 font-display text-[10px] text-center line-clamp-4">
                          {book.title}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">2.5 MB</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{book.pages} páginas</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          type="button"
                          onClick={() => removeDownload(book.id)}
                          className="p-2 text-gray-500 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                          aria-label="Remover download"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors">
                          Ler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}